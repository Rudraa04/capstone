// Backend/models/Orderhistory.js
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import Tiles from "./Tiles.js";
import Sinks from "./Sinks.js";
import Toilets from "./Toilets.js";
import Granite from "./Granite.js";
import Marble from "./Marble.js";
import Bathtubs from "./Bathtubs.js";

const { Types } = mongoose;

const orderConnection = mongoose.createConnection(process.env.ORDERS_URI, {
});

/* ================== SCHEMA ================== */
const OrderItemSchema = new mongoose.Schema(
  {
    productId: { type: String, required: false },
    productType: String,
    category: String, kind: String, type: String,
    sku: String,
    name: String,
    image: String,
    specs: Object,
    size: String,

    // Original field (kept as the *unit* price that checkout sends)
    price: { type: Number, default: 0 },

    quantity: { type: Number, default: 1 },

    // NEW: make pricing explicit & store the computed line total
    unitPrice: { type: Number, default: 0 },     // snapshot of listing price
    pricingUnit: { type: String, enum: ["sqft","piece","box"], default: "piece" },
    sqftPerUnit: { type: Number, default: 0 },   // for sqft-priced lines
    lineTotal: { type: Number, default: 0 },     // what user pays for this line
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
    stockAdjustments: [{ productId: String, type: String, usedField: String, qty: Number }],
  },
  { timestamps: true, collection: "Customer_Order" }
);

OrderSchema.index({ userUid: 1, createdAt: -1 });

/* ================== HELPERS ================== */
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
const STOCK_FIELDS = ["Stock_admin", "stock"];
const NO_AUTO_DECREMENT = new Set(["granite", "marble"]);

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

// size helpers
const BOX_CONFIG = {
  "48x24": 16,
  "24x24": 16,
  "12x18": 9,
  "12x12": 8,
};
const parseSqftFromSize = (sizeStr = "") => {
  const s = String(sizeStr || "").toLowerCase();
  const key = s.replace(/\s+/g, "").replace(/in(ch(es)?)?$/,"");
  if (BOX_CONFIG[key]) return BOX_CONFIG[key];
  const m = s.match(/([\d.]+)\s*[x×]\s*([\d.]+)/i);
  if (!m) return 0;
  const L = parseFloat(m[1]), W = parseFloat(m[2]);
  if (!isFinite(L) || !isFinite(W)) return 0;
  return (L * W) / 144;
};
const isSqftPriced = (tKey) => tKey === "tiles" || tKey === "granite" || tKey === "marble";

// ---- regex helpers for tolerant name matching ----
function escapeRegex(s = "") { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
function buildFlexibleNameRegex(name = "") {
  const cleaned = String(name).trim().replace(/\s+/g, " ");
  const pattern = escapeRegex(cleaned).replace(/\s/g, "\\s+");
  return new RegExp(`^\\s*${pattern}\\s*$`, "i");
}
async function resolveInModel(Model, raw) {
  const direct = toOid(raw?.productId) || toOid(raw?._id);
  if (direct) return direct;
  if (raw?.sku) {
    const sku = String(raw.sku).trim();
    const bySku = await Model.findOne({ $or: [{ SKU: sku }, { sku }] }).select("_id").lean();
    if (bySku?._id) return new Types.ObjectId(bySku._id);
  }
  if (raw?.name) {
    const flexible = buildFlexibleNameRegex(raw.name);
    const byName = await Model.findOne({
      $or: [{ Name: flexible }, { name: flexible }, { Title: flexible }, { title: flexible }],
    }).select("_id").lean();
    if (byName?._id) return new Types.ObjectId(byName._id);
  }
  return null;
}
async function resolveAcrossModels(raw) {
  const hits = [];
  for (const { key, Model } of MODELS) {
    const oid = await resolveInModel(Model, raw);
    if (oid) hits.push({ key, Model, oid });
  }
  if (hits.length === 0) return null;
  if (hits.length > 1) {
    throw new Error(`"${String(raw?.name ?? "Item").trim()}" matched multiple categories; include productType to disambiguate.`);
  }
  return hits[0];
}

/* ================== HOOK: normalize pricing + auto-decrement ================== */
OrderSchema.pre("save", async function () {
  if (!this.isNew) return;
  const items = Array.isArray(this.items) ? this.items : [];
  if (!items.length) return;

  // 1) Normalize pricing snapshot (adds unitPrice/pricingUnit/sqftPerUnit/lineTotal)
  for (const raw of items) {
    const tKey = normalizeType(raw?.productType ?? raw?.category ?? raw?.kind ?? raw?.type);
    const qty = qtyOf(raw);
    const unitPrice = Number(raw.price) || 0;

    let sqft = 0;
    if (isSqftPriced(tKey)) {
      sqft =
        Number(raw?.specs?.sqftPerBox) ||
        Number(raw?.specs?.totalSqft) ||
        parseSqftFromSize(raw?.specs?.size || raw?.size);
    }

    raw.unitPrice = unitPrice;
    raw.pricingUnit = isSqftPriced(tKey) ? "sqft" : "piece";
    raw.sqftPerUnit = isSqftPriced(tKey) ? Number(sqft || 0) : 0;
    raw.lineTotal = Number(((isSqftPriced(tKey) ? unitPrice * (sqft || 0) : unitPrice) * qty).toFixed(2));
  }

  // 2) Auto-decrement stock (unchanged)
  const audit = [];
  try {
    for (const raw of items) {
      const tKey = normalizeType(raw?.productType ?? raw?.category ?? raw?.kind ?? raw?.type);
      let Model = MODEL_BY_KEY[tKey];
      let oid = null;
      let finalKey = tKey;

      if (Model) {
        oid = await resolveInModel(Model, raw);
        if (!oid) {
          const hit = await resolveAcrossModels(raw);
          if (!hit) throw new Error(`"${String(raw?.name ?? "Item").trim()}" not found by id/sku/name.`);
          Model = hit.Model; oid = hit.oid; finalKey = hit.key;
        }
      } else {
        const hit = await resolveAcrossModels(raw);
        if (!hit) throw new Error(`"${String(raw?.name ?? "Item").trim()}" is missing a resolvable product id (id/sku/name).`);
        Model = hit.Model; oid = hit.oid; finalKey = hit.key;
      }

      const qty = qtyOf(raw);

      if (NO_AUTO_DECREMENT.has(finalKey)) continue;

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
        Model, filter: { _id: oid }, revert: { $inc: { [usedField]: qty } },
        productId: String(oid), type: finalKey, usedField, qty,
      });
    }

    this.stockAdjustments = audit.map(a => ({
      productId: a.productId, type: a.type, usedField: a.usedField, qty: a.qty,
    }));
  } catch (err) {
    await Promise.allSettled(audit.map(a => a.Model.updateOne(a.filter, a.revert)));
    throw err;
  }
});

const MODEL_NAME = "Order_Model";
export default orderConnection.models[MODEL_NAME]
  || orderConnection.model(MODEL_NAME, OrderSchema, "Customer_Order");
