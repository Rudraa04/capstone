import mongoose from "mongoose";

/**
 * Same DB resolution as the live ticket model so archives stay together.
 */
function getTicketsDbName() {
  const explicit = (process.env.TICKETS_DB_NAME || "").trim();
  if (explicit) return explicit;

  const uri = (process.env.TICKETS_URI || "").trim();
  const m = uri.match(/\/([^/?]+)(?:[?]|$)/);
  return (m && m[1]) || "Customer_Tickets";
}

const ticketsDb = mongoose.connection.useDb(getTicketsDbName(), { useCache: true });

const ArchivedTicketSchema = new mongoose.Schema(
  {
    ticketId: { type: String, index: true },
    customerId: String,
    issue: String,
    priority: String,
    status: String,
    orderId: String,

    customerSnapshot: {
      name: String,
      email: String,
      phone: String,
    },

    issueEmbedding: { type: [Number], default: [] },
    replies: { type: Array, default: [] },

    archivedAt: { type: Date, default: Date.now },

    // keep originals if you move documents over from live collection
    createdAt: Date,
    updatedAt: Date,
  },
  {
    collection: "archivedtickets",
  }
);

const ArchivedTicket = ticketsDb.model("ArchivedTicket", ArchivedTicketSchema);

// Optional debug
try {
  // @ts-ignore
  console.log(`[TICKETS MODEL] ArchivedTicket DB: ${ticketsDb.name} COLL: archivedtickets`);
} catch {}

export default ArchivedTicket;
