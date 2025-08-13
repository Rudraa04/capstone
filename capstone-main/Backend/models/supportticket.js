import mongoose from "mongoose";
import crypto from "crypto";

const ReplySchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    repliedBy: { type: String, required: true }, // "admin:<name/uid>" or "user:<uid>"
    attachments: [{ url: String, name: String }],
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const SupportTicketSchema = new mongoose.Schema(
  {
    

    ticketId: { type: String, unique: true, index: true }, // e.g., TKT-3F8Z6MD5QJ
    customerId: { type: String, required: true, index: true }, // Firebase UID
    orderId: { type: String, default: null }, // Optional link to an order
    issue: { type: String, required: true },
    status: {
      type: String,
      enum: ["Open", "In Progress", "Resolved"],
      default: "Open",
      index: true,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
    assignedTo: { type: String, default: null }, // Admin UID or name
    replies: [ReplySchema],
    customerSnapshot: {
      name: String,
      email: String,
      phone: String,
    },
    // inside SupportTicketSchema definition:
    issueEmbedding: { type: [Number], select: false }, // optional: hidden by default
  },
  { timestamps: true }
  
);

// Generate a human-readable ticket ID like TKT-ABCDE12345 (10 chars)
function genTicketChunk(len = 10) {
  let chunk = "";
  while (chunk.length < len) {
    const bytes = crypto.randomBytes(8); // 64 bits per loop
    const part = BigInt("0x" + bytes.toString("hex"))
      .toString(36) // base36
      .toUpperCase();
    chunk += part;
  }
  return chunk.slice(0, len);
}

SupportTicketSchema.pre("save", function (next) {
  if (this.ticketId) return next();
  this.ticketId = `TKT-${genTicketChunk(10)}`; // 10-char chunk
  next();
});

// Helpful indexes for fast filtering/sorting
SupportTicketSchema.index({ status: 1, createdAt: -1 });           // status filter + recent first
SupportTicketSchema.index({ createdAt: -1 });                      // date range queries
SupportTicketSchema.index({ "customerSnapshot.email": 1 });        // search by email
SupportTicketSchema.index({ ticketId: 1 }, { unique: true });      // safety (already unique in schema)


export default mongoose.model("SupportTicket", SupportTicketSchema);