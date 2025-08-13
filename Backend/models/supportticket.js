import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";
dotenv.config();

// Connect specifically to the Customer_Tickets database
const TicketsConn = mongoose.createConnection(process.env.TICKETS_URI);

const ReplySchema = new mongoose.Schema(
  {
    message: { type: String, required: true },
    //repliedBy: { type: String, required: true }, // "admin:<name>" or "user:<uid>"
    attachments: [{ url: String, name: String }],
  },
  { _id: false, timestamps: { createdAt: true, updatedAt: false } }
);

const SupportTicketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, unique: true }, // we add the index below
    customerId: { type: String, required: true, index: true }, // Firebase UID
    orderId: { type: String, default: null },
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
    assignedTo: { type: String, default: null },
    replies: [ReplySchema],
    customerSnapshot: {
      name: String,
      email: String,
      phone: String,
    },
    // optional: stored for semantic dedupe; hidden by default
    issueEmbedding: { type: [Number], select: false },
  },
  { timestamps: true }
);

// Generate TKT-XXXXXXXXXX (10 chars)
function genTicketChunk(len = 10) {
  let chunk = "";
  while (chunk.length < len) {
    const part = BigInt("0x" + crypto.randomBytes(8).toString("hex"))
      .toString(36)
      .toUpperCase();
    chunk += part;
  }
  return chunk.slice(0, len);
}

SupportTicketSchema.pre("save", function (next) {
  if (!this.ticketId) this.ticketId = `TKT-${genTicketChunk(10)}`;
  next();
});

// Clean, non-duplicated indexes
SupportTicketSchema.index({ ticketId: 1 }, { unique: true });
SupportTicketSchema.index({ status: 1, createdAt: -1 });
SupportTicketSchema.index({ createdAt: -1 });
SupportTicketSchema.index({ "customerSnapshot.email": 1 });

// IMPORTANT: write to "supporttickets" collection (inside Customer_Tickets DB)
export default TicketsConn.model("SupportTicket", SupportTicketSchema, "supporttickets");