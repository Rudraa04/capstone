import mongoose from "mongoose";

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

export default mongoose.model("ArchivedTicket", ArchivedTicketSchema);