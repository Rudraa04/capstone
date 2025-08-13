// Backend/controllers/supportticketController.js
import mongoose from "mongoose";
import SupportTicket from "../models/supportticket.js";
import ArchivedTicket from "../models/archivedTicket.js";
import { authAdmin } from "../lib/firebaseAdmin.js";

import { classifyPriority } from "../utils/priorityAI.js";
import { moderateMessage } from "../utils/moderationAI.js";
import { embedText, cosineSim } from "../utils/embeddingsAI.js";
import {
  sendMail,
  sendTicketAckToCustomer,
  notifySupportNewTicket,
} from "../utils/mailer.js";

console.log(
  "[TICKETS] SupportTicket DB:",
  SupportTicket.db?.name,
  "COLL:",
  SupportTicket.collection?.collectionName
);
console.log(
  "[TICKETS] ArchivedTicket DB:",
  ArchivedTicket.db?.name,
  "COLL:",
  ArchivedTicket.collection?.collectionName
);

// Helper: find by Mongo _id or human ticketId (e.g., TKT-XXXXX)
async function findTicketByAnyId(id) {
  if (mongoose.Types.ObjectId.isValid(id)) {
    const byObjectId = await SupportTicket.findById(id);
    if (byObjectId) return byObjectId;
  }
  return await SupportTicket.findOne({ ticketId: id });
}

const extractEmailFromIssue = (text = "") => {
  const m = text.match(/contact email.*?:\s*([^\s<>(),;]+@[^\s<>(),;]+)/i);
  return m ? m[1] : "";
};

// ------------------------
// Create Ticket (strict UID + moderation + semantic dedupe + AI priority + email)
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
      const id = String(customerId).trim();
      const userRecord = id.includes("@")
        ? await authAdmin.getUserByEmail(id)
        : await authAdmin.getUser(id);
      customerUid = userRecord.uid;
      name  = userRecord.displayName || name;
      email = userRecord.email || email;
      phone = userRecord.phoneNumber || phone;
    } catch {
      return res.status(400).json({
        error: "Unknown customer. Provide a valid Firebase email or UID.",
      });
    }

    // 3) Semantic DEDUPE (same user, recent window, similar meaning)
    const DEDUPE_MIN = parseInt(process.env.TICKETS_DEDUPE_MINUTES || "10", 10);
    const SIM_THRESH = Number(process.env.TICKETS_DEDUPE_SIM || 0.88);
    const since = new Date(Date.now() - DEDUPE_MIN * 60 * 1000);

    const candidates = await SupportTicket.find({
      customerId: customerUid,
      status: { $ne: "Resolved" },
      createdAt: { $gte: since },
    })
      .sort({ createdAt: -1 })
      .limit(5);

    // compute embedding once for the new issue (best-effort)
    let newVec = [];
    try {
      newVec = await embedText(issue);
    } catch (e) {
      console.warn("[createTicket] embedText failed; continuing:", e?.message || e);
      newVec = [];
    }

    for (const t of candidates) {
      // if both tickets refer to different orders, treat as different
      if (orderId && t.orderId && t.orderId !== orderId) continue;

      let vec = t.issueEmbedding;
      if (!Array.isArray(vec) || vec.length === 0) {
        // lazy embed candidate and store for next time (non-fatal)
        try {
          vec = await embedText(t.issue);
          t.issueEmbedding = vec;
          await t.save();
        } catch {
          vec = [];
        }
      }

      const sim = cosineSim(newVec, vec || []);
      if (sim >= SIM_THRESH) {
        // Reuse existing ticket instead of creating a new one
        return res.status(200).json(t);
      }
    }

    // 4) AI decides priority (ignore client priority); fallback to "Low" on failure
    let priority = "Low";
    try {
      const out = await classifyPriority(issue, { name, email });
      if (out?.priority && ["Low", "Medium", "High"].includes(out.priority)) {
        priority = out.priority;
      }
    } catch (e) {
      console.warn("[createTicket] classifyPriority failed; defaulting to Low:", e?.message || e);
    }

    const payload = {
      customerId: customerUid, // store UID
      issue,
      priority,                // AI-set (or fallback)
      orderId,
      customerSnapshot: { name, email, phone },
      issueEmbedding: newVec,  // stored if your schema allows; ignored otherwise
    };

    // 5) Duplicate safety: retry create up to 5x if ticketId collides
    let newTicket = null;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        newTicket = await SupportTicket.create(payload); // pre-save generates ticketId
        break;
      } catch (e) {
        const isDup =
          e?.code === 11000 &&
          (e?.keyPattern?.ticketId || String(e?.message).includes("ticketId"));
        if (isDup && attempt < 5) continue;
        console.error("Error creating ticket:", e);
        return res.status(500).json({ error: "Failed to create ticket." });
      }
    }

    // 6) Fire-and-forget emails (won't block API response)
    (async () => {
      try {
        const toEmail = email || extractEmailFromIssue(issue);
        if (toEmail) {
          await sendTicketAckToCustomer({
            ticketId: newTicket.ticketId,
            issue,
            toEmail,
            customerName: name,
            orderId,
          });
        } else {
          console.warn("[mail] no customer email found; skip confirmation");
        }

        await notifySupportNewTicket({
          ticketId: newTicket.ticketId,
          issue,
          customerEmail: email || "",
          customerName: name || "",
          orderId: orderId || "",
        });
      } catch (err) {
        console.error("[mail] ticket create email failed:", err?.message || err);
      }
    })();

    // respond OK
    return res.status(201).json(newTicket);
  } catch (err) {
    console.error("Error creating ticket (outer):", err);
    return res.status(500).json({ error: "Failed to create ticket." });
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
// Reply to Ticket  (moderation + email to customer)
// ------------------------
export const replyToTicket = async (req, res) => {
  try {
    const { message, repliedBy } = req.body;

    if (!message?.trim() || !repliedBy?.trim()) {
      return res.status(400).json({ error: "message and repliedBy are required." });
    }

    // Moderate admin text (reuse same moderation)
    const mod = await moderateMessage(message);
    if (!mod.ok) {
      return res.status(400).json({
        error: "Reply blocked: content violates guidelines. Please rephrase.",
      });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ error: "Ticket not found." });

    // Append reply and move status to In Progress if it was Open
    ticket.replies.push({ message: message.trim(), repliedBy: repliedBy.trim() });
    if (ticket.status === "Open") ticket.status = "In Progress";
    await ticket.save();

    // Fire-and-forget email to the customer
    (async () => {
      try {
        const toEmail =
          ticket.customerSnapshot?.email || extractEmailFromIssue(ticket.issue);
        if (!toEmail) {
          console.warn("[mail] no customer email on ticket; skip reply email");
          return;
        }

        const subject = `[${ticket.ticketId}] Update from Patel Ceramics Support`;
        const safeName = ticket.customerSnapshot?.name || "there";
        const safeBody = String(message)
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/\n/g, "<br/>");

        await sendMail({
          to: toEmail,
          subject,
          text:
`Hi ${safeName},

We’ve posted a new reply on your ticket ${ticket.ticketId}:

${message}

You can reply to this email to continue the conversation.

— Patel Ceramics Support`,
          html:
`<p>Hi ${safeName},</p>
<p>We’ve posted a new reply on your ticket <b>${ticket.ticketId}</b>:</p>
<blockquote style="margin:8px 0;padding:8px 12px;border-left:3px solid #ddd;background:#f7f7f7;">${safeBody}</blockquote>
<p>You can reply to this email to continue the conversation.</p>
<p>— Patel Ceramics Support</p>`,
          headers: { "X-Ticket-ID": ticket.ticketId },
        });
      } catch (e) {
        console.error("[mail] admin reply email failed:", e?.message || e);
      }
    })();

    return res.json(ticket);
  } catch (err) {
    console.error("Error replying to ticket:", err);
    return res.status(500).json({ error: "Failed to reply to ticket." });
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
