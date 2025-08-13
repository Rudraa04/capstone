// Backend/models/Orderhistory.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// product models (same folder)
import Tiles from "./Tiles.js";
import Sinks from "./Sinks.js";
import Toilets from "./Toilets.js";
import Granite from "./Granite.js";
import Marble from "./Marble.js";
import Bathtubs from "./Bathtubs.js";

const { Types } = mongoose;

// dedicated connection
const orderConnection = mongoose.createConnection(process.env.MONGO_URI, {
  dbName: "Order_History",
});

/* ================== SCHEMA ================== */
const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: false }, // keep as string; we resolve in the hook
    productType: String,   // "tiles" | "sinks" | "toilets" | "granite" | "marble" | "bathtubs" (or synonyms)
    category: String, kind: String, type: String,
    sku: String,
    name: String,
    image: String,
    specs: Object,
    size: String,
    price: { type: Number, default: 0 },
    quantity: { type: Number, default: 1 },
  },
  { _id: false }
);

const OrderSchema = new mongoose.Schema(
  {
    userUid: { type: String, required: true },
    items: { type: [OrderItemSchema], required: true },

    subtotal: { type: Number, default: 0 },
    discountTotal: { type: Number, default: 0 },
    taxTotal: { type: Number, default: 0 },
    shippingFee: { type: Number, default: 0 },
    currency: { type: String, default: "INR" },
    totalAmount: { type: Number, default: 0 },

    paymentRef: String,
    payment: Object,
    shippingAddress: Object,

    status: {
      type: String,
      enum: ["Pending", "Paid", "Shipped", "Delivered", "Cancelled"],
      default: "Paid",
    },

    // audit of stock changes
    stockAdjustments: [{ productId: String, type: String, usedField: String, qty: Number }],
  },
  { timestamps: true, collection: "Customer_Order" }
);

OrderSchema.index({ userUid: 1, createdAt: -1 });

/* ================== HELPERS ================== */

// 1) More generous synonyms
const TYPE_MAP = {
  tile: "tiles", tiles: "tiles",

  sink: "sinks", sinks: "sinks",
  basin: "sinks", basins: "sinks",
  washbasin: "sinks", "wash basin": "sinks",
  sanitary: "sinks", sanitaryware: "sinks",

  toilet: "toilets", toilets: "toilets",
  wc: "toilets", commode: "toilets", "water closet": "toilets",

  granite: "granite", granites: "granite",
  marble: "marble", marbles: "marble",

  bathtub: "bathtubs", bathtubs: "bathtubs", tub: "bathtubs",
};

const MODELS = [
  { key: "tiles",     Model: Tiles   },
  { key: "sinks",     Model: Sinks   },
  { key: "toilets",   Model: Toilets },
  { key: "granite",   Model: Granite },
  { key: "marble",    Model: Marble  },
  { key: "bathtubs",  Model: Bathtubs},
];

const MODEL_BY_KEY = Object.fromEntries(MODELS.map(m => [m.key, m.Model]));

const STOCK_FIELDS = ["Stock_admin", "stock"]; // try in this order

const norm = (v) => String(v ?? "").trim().toLowerCase();
const normalizeType = (raw) => TYPE_MAP[norm(raw)] || norm(raw);
const qtyOf = (x) => {
  const n = Number(x?.quantity ?? x?.qty ?? x?.count ?? x?.boxes ?? 1);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : 1;
};
const toOid = (val) => {
  if (val == null) return null;
  const s = String(val).trim();
  return Types.ObjectId.isValid(s) ? new Types.ObjectId(s) : null;
};

// ---- NEW: regex helpers for tolerant name matching ----
function escapeRegex(s = "") {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
/**
 * Build a tolerant RegExp for product names:
 * - trims leading/trailing whitespace
 * - collapses inner spaces to \s+
 * - case-insensitive
 */
function buildFlexibleNameRegex(name = "") {
  const cleaned = String(name).trim().replace(/\s+/g, " ");
  const pattern = escapeRegex(cleaned).replace(/\s/g, "\\s+");
  return new RegExp(`^\\s*${pattern}\\s*$`, "i");
}

// Try to resolve a product by _id / SKU / Name in a specific model
async function resolveInModel(Model, raw) {
  // 1) by direct id
  const direct = toOid(raw?.productId) || toOid(raw?._id);
  if (direct) return direct;

  // 2) by SKU (both "SKU" and "sku")
  if (raw?.sku) {
    const sku = String(raw.sku).trim();
    const bySku = await Model.findOne({ $or: [{ SKU: sku }, { sku }] })
      .select("_id")
      .lean();
    if (bySku?._id) return new Types.ObjectId(bySku._id);
  }

  // 3) by Name (tolerant, case-insensitive, ignores trailing/extra spaces)
  if (raw?.name) {
    const flexible = buildFlexibleNameRegex(raw.name);
    const byName = await Model.findOne({
      $or: [{ Name: flexible }, { name: flexible }, { Title: flexible }, { title: flexible }],
    })
      .select("_id")
      .lean();
    if (byName?._id) return new Types.ObjectId(byName._id);
  }

  return null;
}

// Fallback: try ALL models if type is missing/unknown or lookup failed in that model.
// If multiple models match, throw an explicit ambiguity error.
async function resolveAcrossModels(raw) {
  const hits = [];
  for (const { key, Model } of MODELS) {
    const oid = await resolveInModel(Model, raw);
    if (oid) hits.push({ key, Model, oid });
  }
  if (hits.length === 0) return null;
  if (hits.length > 1) {
    throw new Error(
      `"${String(raw?.name ?? "Item").trim()}" matched multiple categories; include productType to disambiguate.`
    );
  }
  return hits[0]; // { key, Model, oid }
}

/* ================== HOOK: auto-decrement ================== */
OrderSchema.pre("save", async function () {
  if (!this.isNew) return;
  const items = Array.isArray(this.items) ? this.items : [];
  if (!items.length) return;

  const audit = [];

  try {
    for (const raw of items) {
      // 1) pick model by normalized type, or fall back to scanning all models
      const tKey = normalizeType(raw?.productType ?? raw?.category ?? raw?.kind ?? raw?.type);
      let Model = MODEL_BY_KEY[tKey];
      let oid = null;
      let finalKey = tKey;

      if (Model) {
        // try inside declared model first
        oid = await resolveInModel(Model, raw);
        if (!oid) {
          // declared type but not found there → try across all as fallback
          const hit = await resolveAcrossModels(raw);
          if (!hit) {
            throw new Error(`"${String(raw?.name ?? "Item").trim()}" not found by id/sku/name.`);
          }
          Model = hit.Model;
          oid = hit.oid;
          finalKey = hit.key;
        }
      } else {
        // unknown/missing type → scan all
        const hit = await resolveAcrossModels(raw);
        if (!hit) {
          throw new Error(
            `"${String(raw?.name ?? "Item").trim()}" is missing a resolvable product id (id/sku/name).`
          );
        }
        Model = hit.Model;
        oid = hit.oid;
        finalKey = hit.key;
      }

      const qty = qtyOf(raw);

      // 2) decrement with guard
      let ok = false, usedField = null;
      for (const f of STOCK_FIELDS) {
        const res = await Model.updateOne(
          { _id: oid, [f]: { $gte: qty } },
          { $inc: { [f]: -qty } }
        );
        if (res.modifiedCount) { ok = true; usedField = f; break; }
      }
      if (!ok) throw new Error(`"${String(raw?.name ?? "Item").trim()}" is out of stock or not found.`);

      audit.push({
        Model,
        filter: { _id: oid },
        revert: { $inc: { [usedField]: qty } },
        productId: String(oid),
        type: finalKey,
        usedField,
        qty,
      });
    }

    this.stockAdjustments = audit.map(a => ({
      productId: a.productId, type: a.type, usedField: a.usedField, qty: a.qty,
    }));
  } catch (err) {
    // rollback any partial decrements
    await Promise.allSettled(audit.map(a => a.Model.updateOne(a.filter, a.revert)));
    throw err;
  }
});

// idempotent export
const MODEL_NAME = "Order_Model";
export default orderConnection.models[MODEL_NAME]
  || orderConnection.model(MODEL_NAME, OrderSchema, "Customer_Order");
