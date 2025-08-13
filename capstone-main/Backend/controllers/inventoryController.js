// Backend/controllers/inventoryController.js

import Tiles from "../models/Tiles.js";
import Sinks from "../models/Sinks.js";
import Toilets from "../models/Toilets.js";
import Granite from "../models/Granite.js";
import Marble from "../models/Marble.js";
import Bathtubs from "../models/Bathtubs.js";

// ---- tiny helpers ----
const toNum = (v) => (v === null || v === undefined || v === "" ? NaN : Number(v));

// names & categories (support the Capitalized fields your schemas use)
const pickName = (d) => d.Name || d.name || d.productName || d.title || "Unnamed";
const pickCategory = (d, fallback) => d.Category || d.category || d.productType || fallback;

// NEW: map "Collection" to what you really store
// - Ceramics (Tiles, Sinks, Toilets, Bathtubs): SubCategory
// - Slabs   (Marble, Granite): Origin
const pickCollection = (d, cat) => {
  // if an explicit collection/series exists, prefer it
  if (d.collection || d.collectionName || d.series) {
    return d.collection || d.collectionName || d.series;
  }
  if (["Tiles", "Sinks", "Toilets", "Bathtubs"].includes(cat)) {
    return d.SubCategory || "";
  }
  if (["Marble", "Granite"].includes(cat)) {
    return d.Origin || "";
  }
  return "";
};

// stock keys — include your Capitalized field used in models
const STOCK_KEYS = [
  "Stock_admin",           // ← your models use this
  "stock", "quantity", "qty", "stockQty", "available", "inStock",
  "qtyAvailable", "currentStock",
];

const pickStock = (d) => {
  for (const k of STOCK_KEYS) if (k in d) return toNum(d[k]);
  return NaN;
};

// per-item threshold keys (only used if you store them on a doc)
const THRESH_KEYS = [
  "reorderLevel", "reorder", "minStock", "threshold",
  "lowStockThreshold", "restockThreshold", "reorder_point", "reorderPoint",
];
const pickPerItemThreshold = (d) => {
  for (const k of THRESH_KEYS) if (k in d) return toNum(d[k]);
  return NaN;
};

async function collectLowStock(Model, categoryLabel, categoryThreshold) {
  const fields =
    "_id Name name productName title Category category productType " +
    STOCK_KEYS.join(" ") + " " + THRESH_KEYS.join(" ") + " " +
    "SubCategory Origin collection series collectionName";

  const docs = await Model.find({}, fields).lean();
  const catDefault = Number.isFinite(categoryThreshold) ? Number(categoryThreshold) : 0;

  const items = [];
  for (const d of docs) {
    const stock = pickStock(d);
    const perItem = pickPerItemThreshold(d);

    // prefer per-item threshold if present & > 0, else category default
    const threshold =
      Number.isFinite(perItem) && perItem > 0
        ? perItem
        : catDefault > 0
        ? catDefault
        : NaN;

    if (Number.isFinite(stock) && Number.isFinite(threshold) && stock <= threshold) {
      items.push({
        _id: d._id,
        name: pickName(d),
        category: pickCategory(d, categoryLabel),
        stock,
        reorderLevel: threshold,
        collection: pickCollection(d, categoryLabel), // ✅ now filled
      });
    }
  }
  return items;
}

/**
 * GET /api/inventory/low-stock
 * Uses thresholds injected by routes/lowStockRoutes.js (config/lowStock.js)
 * Optional: ?limit=100
 */
export const getLowStock = async (req, res) => {
  try {
    const limit = Math.max(1, Number(req.query.limit ?? 100));
    const cat = req.lowStockThresholds || {}; // injected by route

    const lists = await Promise.all([
      collectLowStock(Tiles,    "Tiles",    cat.Tiles),
      collectLowStock(Sinks,    "Sinks",    cat.Sinks),
      collectLowStock(Toilets,  "Toilets",  cat.Toilets),
      collectLowStock(Granite,  "Granite",  cat.Granite),
      collectLowStock(Marble,   "Marble",   cat.Marble),
      collectLowStock(Bathtubs, "Bathtubs", cat.Bathtubs),
    ]);

    const combined = lists.flat().sort((a, b) => a.stock - b.stock);
    const items = combined.slice(0, limit);

    return res.json({ items, count: combined.length });
  } catch (err) {
    console.error("[low-stock] error:", err);
    return res.status(500).json({ error: "Failed to load low-stock items." });
  }
};
