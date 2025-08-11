import express from "express";
import { profanityGuard } from "../middleware/profanityGuard.js";
import {
  createTicket,
  getAllTickets,
  getTicketById,
  replyToTicket,
  updateTicketStatus,
  deleteTicket
} from "../controllers/supportticketController.js";

const router = express.Router();

// Create a new support ticket
router.post("/", profanityGuard({ mode: "reject" }), createTicket);

// Get all tickets (admin view)
router.get("/", getAllTickets);

// Get single ticket details
router.get("/:id", getTicketById);

// Reply to a ticket
router.post("/:id/reply", profanityGuard({ mode: "mask" }), replyToTicket);

// Update ticket status (e.g., Open → Resolved)
router.patch("/:id/status", updateTicketStatus);

// Delete a ticket (e.g., after archiving)
router.delete("/:id", deleteTicket);

export default router;