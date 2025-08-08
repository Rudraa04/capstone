// models/order.model.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// EITHER: use a dedicated URI…
/*
process.env.ORDER_HISTORY_URI = 'mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/Order_History'
const orderConn = mongoose.createConnection(process.env.ORDER_HISTORY_URI);
*/

// …OR: reuse cluster URI but target the DB by name:
const orderConnection = mongoose.createConnection(process.env.MONGO_URI, {
  dbName: 'Order_History',
});

const OrderSchema = new mongoose.Schema(
  {
    // If you're using Firebase Auth, store UID as string:
    userUid: { type: String, required: true }, // e.g., 'O1aBcD23...'
    // If you prefer MongoDB user _id instead, tell me and I’ll switch this to ObjectId.

    items: [
      {
        productId: { type: mongoose.Schema.Types.ObjectId, required: true },
        productType: {
          type: String,
          enum: ['Tile', 'Sink', 'Toilet', 'Granite', 'Marble'],
          required: true,
        },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }, // price per unit you charged
        unit: { type: String, default: 'box' },  // 'box' | 'piece'
        name: String,                             // snapshot name at purchase time (optional but useful)                            // optional
      },
    ],

    totalAmount: { type: Number, required: true },
    


    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,                // createdAt / updatedAt
    collection: 'Customer_Order',    // <- EXACT collection name
  }
);

// helpful index for fetching a user's history by most recent first
OrderSchema.index({ userUid: 1, createdAt: -1 });

export default orderConnection.model('Order_Model', OrderSchema, 'Customer_Order' );