import mongoose from "mongoose";
import SupportTicket from "../models/supportticket.js";
import ArchivedTicket from "../models/archivedTicket.js";
import { authAdmin } from "../lib/firebaseAdmin.js";

import { classifyPriority } from "../utils/priorityAI.js";
import { moderateMessage } from "../utils/moderationAI.js";
import { embedText, cosineSim } from "../utils/embeddingsAI.js";

// Helper: find by Mongo _id or human ticketId (e.g., TKT-XXXXX)
async function findTicketByAnyId(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const byObjectId = await SupportTicket.findById(id);
    if (byObjectId) return byObjectId;
  }
  return await SupportTicket.findOne({ ticketId: id });
}

// ------------------------
// Create Ticket (strict UID + moderation + semantic dedupe + AI priority)
// ------------------------
export const createTicket = async (req, res) => {
  try {
    const { customerId, issue, orderId = null } = req.body;

    if (!customerId || !issue) {
      return res.status(400).json({ error: "customerId and issue are required." });
    }

    // 1) Moderate customer text (block abusive/unsafe content)
    const mod = await moderateMessage(issue);
    if (!mod.ok) {
      return res.status(400).json({
        error: "Ticket description violates our content guidelines. Please rephrase.",
      });
    }

    // 2) Resolve to a real Firebase user; always store UID (strict)
    let name = "Unknown", email = "", phone = "", customerUid = null;
    try {
      let userRecord;
      if (customerId.includes("@")) {
        userRecord = await authAdmin.getUserByEmail(customerId);
      } else {
        userRecord = await authAdmin.getUser(customerId);
      }
      customerUid = userRecord.uid;
      name = userRecord.displayName || name;
      email = userRecord.email || email;
      phone = userRecord.phoneNumber || phone;
    } catch (e) {
      return res.status(400).json({
        error: "Unknown customer. Provide a valid Firebase email or UID.",
      });
    }

    // 3) Semantic DEDUPE (same user, recent window, similar meaning)
    const DEDUPE_MIN = parseInt(process.env.TICKETS_DEDUPE_MINUTES || "10", 10);
    const SIM_THRESH = Number(process.env.TICKETS_DEDUPE_SIM || 0.88);
    const since = new Date(Date.now() - DEDUPE_MIN * 60 * 1000);

    // pull a few recent non-resolved tickets for this customer
    const candidates = await SupportTicket.find({
      customerId: customerUid,
      status: { $ne: "Resolved" },
      createdAt: { $gte: since },
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // compute embedding once for the new issue
    const newVec = await embedText(issue);

    for (const t of candidates) {
      // order context: if both have orderId and they differ, don't merge
      if (orderId && t.orderId && t.orderId !== orderId) continue;

      let vec = t.issueEmbedding;
      if (!Array.isArray(vec) || vec.length === 0) {
        // embed candidate on the fly and try to store for next time (best-effort)
        try {
          vec = await embedText(t.issue);
          t.issueEmbedding = vec;
          await t.save();
        } catch {
          // ignore save failures (e.g., schema missing issueEmbedding)
        }
      }

      const sim = cosineSim(newVec, vec || []);
      if (sim >= SIM_THRESH) {
        // Reuse existing ticket instead of creating a new one
        return res.status(200).json(t);
      }
    }

    // 4) AI decides priority (ignore any client-sent priority)
    const { priority } = await classifyPriority(issue, { name, email });

    const payload = {
      customerId: customerUid, // store UID
      issue,
      priority,                // AI-set
      orderId,
      customerSnapshot: { name, email, phone },
      issueEmbedding: newVec,  // store embedding once (if schema has the field)
    };

    // 5) Duplicate safety: retry create up to 5x if ticketId collides
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        const newTicket = await SupportTicket.create(payload); // pre-save generates ticketId
        return res.status(201).json(newTicket);
      } catch (e) {
        const isDup =
          e?.code === 11000 &&
          (e?.keyPattern?.ticketId || String(e?.message).includes("ticketId"));
        if (isDup && attempt < 5) continue;
        console.error("Error creating ticket:", e);
        return res.status(500).json({ error: "Failed to create ticket." });
      }
    }
  } catch (err) {
    console.error("Error creating ticket (outer):", err);
    res.status(500).json({ error: "Failed to create ticket." });
  }
};

// ------------------------
// Get All Tickets (server-side filters: status, q, from/to)
// ------------------------
export const getAllTickets = async (req, res) => {
  try {
    const { status, q, from, to } = req.query;
    const filter = {};

    if (status && status !== "All") filter.status = status;

    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to)   filter.createdAt.$lte = new Date(to);
    }

    if (q && q.trim()) {
      const regex = new RegExp(q.trim(), "i");
      filter.$or = [
        { issue: regex },
        { ticketId: regex },
        { "customerSnapshot.name": regex },
        { "customerSnapshot.email": regex },
      ];
    }

    const tickets = await SupportTicket.find(filter).sort({ createdAt: -1 });
    res.json(tickets);
  } catch (err) {
    console.error("Error fetching tickets:", err);
    res.status(500).json({ error: "Failed to fetch tickets." });
  }
};

// ------------------------
// Get Single Ticket (by _id or ticketId)
// ------------------------
export const getTicketById = async (req, res) => {
  try {
    const ticket = await findTicketByAnyId(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found." });
    res.json(ticket);
  } catch (err) {
    console.error("Error fetching ticket:", err);
    res.status(500).json({ error: "Failed to fetch ticket." });
  }
};

// ------------------------
// Reply to Ticket (AI moderation; by _id or ticketId)
// ------------------------
export const replyToTicket = async (req, res) => {
  try {
    const { message, repliedBy } = req.body;
    if (!message || !repliedBy) {
      return res.status(400).json({ error: "message and repliedBy are required." });
    }

    // Moderate admin reply
    const mod = await moderateMessage(message);
    if (!mod.ok) {
      return res.status(400).json({
        error: "Reply blocked by content policy. Please rephrase.",
      });
    }

    const ticket = await findTicketByAnyId(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found." });

    ticket.replies.push({ message, repliedBy });
    ticket.status = "In Progress"; // auto-update
    await ticket.save();

    res.json(ticket);
  } catch (err) {
    console.error("Error replying to ticket:", err);
    res.status(500).json({ error: "Failed to reply to ticket." });
  }
};

// ------------------------
// Update Ticket Status (by _id or ticketId; resolve → archive + remove)
// ------------------------
export const updateTicketStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const ticket = await findTicketByAnyId(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found." });

    ticket.status = status;
    await ticket.save();

    if (status === "Resolved") {
      await ArchivedTicket.create({
        ...ticket.toObject(),
        archivedAt: new Date(),
      });
      await ticket.deleteOne();
      return res.json({ message: "Ticket resolved and archived." });
    }

    res.json(ticket);
  } catch (err) {
    console.error("Error updating ticket status:", err);
    res.status(500).json({ error: "Failed to update ticket status." });
  }
};

// ------------------------
// Delete Ticket (by _id or ticketId)
// ------------------------
export const deleteTicket = async (req, res) => {
  try {
    const ticket = await findTicketByAnyId(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found." });

    await ticket.deleteOne();
    res.json({ message: "Ticket deleted successfully." });
  } catch (err) {
    console.error("Error deleting ticket:", err);
    res.status(500).json({ error: "Failed to delete ticket." });
  }
};