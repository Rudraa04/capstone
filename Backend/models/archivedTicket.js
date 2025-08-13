import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Same DB: Customer_Tickets
const TicketsConn = mongoose.createConnection(process.env.TICKETS_URI);

const ArchivedTicketSchema = new mongoose.Schema(
  {
    originalId: { type: mongoose.Schema.Types.ObjectId, index: true },
    ticketId: String,
    customerId: String,
    orderId: String,
    issue: String,
    status: String,
    priority: String,
    assignedTo: String,
    replies: [
      {
        message: String,
        repliedBy: String,
        attachments: [{ url: String, name: String }],
        createdAt: Date,
      },
    ],
    customerSnapshot: {
      name: String,
      email: String,
      phone: String,
    },
    createdAt: Date,
    updatedAt: Date,
    archivedAt: { type: Date, default: Date.now },
  },
  { timestamps: false }
);

// IMPORTANT: write to "archivedtickets" collection (inside Customer_Tickets DB)
export default TicketsConn.model("ArchivedTicket", ArchivedTicketSchema, "archivedtickets");