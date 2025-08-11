// models/order.model.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const orderConnection = mongoose.createConnection(process.env.MONGO_URI, {
  dbName: 'Order_History',
});

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, required: false },
    sku: String,
    name: String,                  // snapshot name
    image: String,                 // snapshot image URL
    specs: Object,                 // { color, size, finish, ... } free-form
    productType: {
      type: String,
      enum: ['Tile', 'Sink', 'Toilet', 'Granite', 'Marble'],
      required: true,
    },
    unit: { type: String, default: 'box' },  // 'box' | 'piece' | etc.
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }, // unit price charged (pre-tax)
    lineTotal: { type: Number },             // convenience: price * quantity
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    // Who
    userUid: { type: String, required: true },

    // What
    items: { type: [OrderItemSchema], required: true },

    // Totals (store a snapshot so UI never has to recompute)
    subtotal: Number,            // sum of lineTotals (pre-tax, pre-discount)
    discountTotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }, // show ₹ in UI
    totalAmount: { type: Number, required: true }, // grand total charged

    // Shipping snapshot
    shippingAddress: {
      name: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },

    // Delivery (outsourced) – fill when the partner sends you data
    tracking: {
      provider: String,          // e.g., Delhivery, BlueDart, etc.
      trackingCode: String,      // partner’s code
      trackingUrl: String,       // deep link to partner tracking page
      expectedDelivery: Date,
    },

    // Optional status timeline for pretty UI (use when you want)
    timeline: [
      {
        label: String,           // 'Ordered', 'Shipped', 'Delivered'
        at: { type: Date, default: Date.now },
        note: String,
      },
    ],

    // Payment snapshot
    payment: {
      method: String,            // 'Card', 'UPI', etc.
      processor: String,         // 'Square', 'Razorpay', etc.
      referenceId: String,       // payment id/receipt
      receiptUrl: String,        // link if available
    },

    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
  },
  {
    timestamps: true,
    collection: 'Customer_Order',
  }
);

OrderSchema.index({ userUid: 1, createdAt: -1 });

export default orderConnection.model('Order_Model', OrderSchema, 'Customer_Order');
