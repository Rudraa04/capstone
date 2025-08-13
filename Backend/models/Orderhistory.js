// models/order.model.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const orderConnection = mongoose.createConnection(process.env.MONGO_URI, {
  dbName: 'Order_History',
});

// Canonical set (all lowercase, singular)
const PRODUCT_TYPES = ['tile','sink','toilet','bathtub','granite','marble','sanitaryware'];

// Map common variants → canonical
const normalizeType = (t = '') => {
  const x = String(t).toLowerCase().trim();
  const map = {
    tiles: 'tile',
    sinks: 'sink',
    toilets: 'toilet',
    bathtubs: 'bathtub',
    sanitary: 'sanitaryware',
    sanitaryware: 'sanitaryware',
    tile: 'tile', sink: 'sink', toilet: 'toilet', bathtub: 'bathtub',
    granite: 'granite', marble: 'marble',
  };
  return map[x] || x;
};

const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, required: false }, // keep optional
    sku: String,
    name: String,
    image: String,
    specs: Object,
    productType: {
      type: String,
      enum: PRODUCT_TYPES,
      required: true,
      lowercase: true,
      trim: true,
      set: normalizeType, // normalize on assignment
    },
    unit: { type: String, default: 'box' }, // 'piece' for toilets/bathtubs at write time if you prefer
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    lineTotal: { type: Number },
  },
  { _id: false }
);

// Convenience: compute lineTotal if missing
OrderItemSchema.pre('validate', function (next) {
  if (this.price != null && this.quantity != null && this.lineTotal == null) {
    this.lineTotal = this.price * this.quantity;
  }
  next();
});

const OrderSchema = new mongoose.Schema(
  {
    userUid: { type: String, required: true },
    items: { type: [OrderItemSchema], required: true },

    subtotal: Number,
    discountTotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' }, // you’re charging in INR via Square

    totalAmount: { type: Number, required: true },

    shippingAddress: {
      name: String, phone: String, street: String, city: String,
      state: String, postalCode: String, country: String,
    },

    tracking: {
      provider: String, trackingCode: String, trackingUrl: String,
      expectedDelivery: Date,
    },

    timeline: [{ label: String, at: { type: Date, default: Date.now }, note: String }],

    payment: {
      method: String,
      processor: String,
      referenceId: String,
      receiptUrl: String,
    },

    status: {
      type: String,
      enum: ['Pending', 'Paid', 'Shipped', 'Delivered', 'Cancelled'],
      default: 'Pending',
    },
  },
  { timestamps: true, collection: 'Customer_Order' }
);

OrderSchema.index({ userUid: 1, createdAt: -1 });

export default orderConnection.model('Order_Model', OrderSchema, 'Customer_Order');
