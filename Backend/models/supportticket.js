import mongoose from "mongoose";

/**
 * Resolve the MongoDB database name for tickets.
 * Priority:
 *   1) process.env.TICKETS_DB_NAME
 *   2) last path segment of process.env.TICKETS_URI
 *   3) "Customer_Tickets" (default)
 */
function getTicketsDbName() {
  const explicit = (process.env.TICKETS_DB_NAME || "").trim();
  if (explicit) return explicit;

  const uri = (process.env.TICKETS_URI || "").trim();
  const m = uri.match(/\/([^/?]+)(?:[?]|$)/);
  return (m && m[1]) || "Customer_Tickets";
}

// Attach model to the specific DB (not the default connection DB)
const ticketsDb = mongoose.connection.useDb(getTicketsDbName(), { useCache: true });

/* ---------- Subdocuments ---------- */
const ReplySchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    repliedBy: { type: String, required: true }, // e.g. "admin:rudra" | "customer"
  },
  {
    _id: false,
    timestamps: { createdAt: true, updatedAt: false },
  }
);

/* ---------- Main Ticket Schema ---------- */
const SupportTicketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, unique: true, index: true }, // human-friendly ID like TKT-XXXXXX
    customerId: { type: String, default: null },          // Firebase UID (strict)
    issue: { type: String, required: true },
    priority: { type: String, enum: ["Low", "Medium", "High"], default: "Low" },
    status: { type: String, enum: ["Open", "In Progress", "Resolved"], default: "Open" },

    orderId: { type: String, default: null },

   customerSnapshot: {
    name:  { type: String, default: "" },
    email: { type: String, required: true },  // required so guests still have a contact
    phone: { type: String, default: "" },
     },

    issueEmbedding: { type: [Number], default: [] },
    replies: { type: [ReplySchema], default: [] },
  },
  {
    timestamps: true,
    collection: "supporttickets",
  }
);

// Generate ticketId once pre-save (avoid duplicate index warnings)
SupportTicketSchema.pre("save", function (next) {
  if (!this.ticketId) {
    const rand = Math.random().toString(36).toUpperCase().slice(2, 8);
    this.ticketId = `TKT-${rand}`;
  }
  next();
});

const SupportTicket = ticketsDb.model("SupportTicket", SupportTicketSchema);

// Optional debug (safe to keep)
try {
  // @ts-ignore - name exists on connection
  console.log(`[TICKETS MODEL] SupportTicket DB: ${ticketsDb.name} COLL: supporttickets`);
} catch {}

export default SupportTicket;
