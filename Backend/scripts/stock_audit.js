// Backend/scripts/stock_audit.js
// Show recent order stock adjustments + current stock for each product.
//How to run this script
{/*node Backend/scripts/stock_audit.js            # last 10 orders
node Backend/scripts/stock_audit.js --limit 5  # last 5
node Backend/scripts/stock_audit.js --since 2d # orders in last 2 days */}

import "dotenv/config";
import mongoose from "mongoose";

// import your models (reuses same connections)
import Order from "../models/Orderhistory.js";
import Tiles from "../models/Tiles.js";
import Sinks from "../models/Sinks.js";
import Toilets from "../models/Toilets.js";
import Granite from "../models/Granite.js";
import Marble from "../models/Marble.js";
import Bathtubs from "../models/Bathtubs.js";

const MODEL_BY_TYPE = {
  tiles: Tiles,
  sinks: Sinks,
  toilets: Toilets,
  granite: Granite,
  marble: Marble,
  bathtubs: Bathtubs,
};

// ---------- CLI args ----------
const args = Object.fromEntries(
  process.argv.slice(2).map((a) => {
    const m = a.match(/^--([^=]+)(=(.*))?$/);
    return m ? [m[1], m[3] ?? true] : [a, true];
  })
);
const LIMIT = Number(args.limit ?? 10);
const sinceArg = args.since; // e.g. "2d", "12h", or ISO like "2025-08-10"
let sinceDate = null;
if (sinceArg) {
  if (/^\d+\s*d$/.test(sinceArg)) {
    const d = parseInt(sinceArg);
    sinceDate = new Date(Date.now() - d * 24 * 60 * 60 * 1000);
  } else if (/^\d+\s*h$/.test(sinceArg)) {
    const h = parseInt(sinceArg);
    sinceDate = new Date(Date.now() - h * 60 * 60 * 1000);
  } else {
    const dt = new Date(sinceArg);
    if (!isNaN(dt)) sinceDate = dt;
  }
}

// ---------- main ----------
(async () => {
  try {
    // Ensure we can talk to Mongo (Order model already has its own connection; this keeps the default happy)
    if (!mongoose.connection.readyState) {
      await mongoose.connect(process.env.MONGO_URI);
    }

    const query = {};
    if (sinceDate) query.createdAt = { $gte: sinceDate };

    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .limit(LIMIT)
      .lean();

    if (!orders.length) {
      console.log("No orders found for the given range.");
      process.exit(0);
    }

    for (const o of orders) {
      console.log(
        `\nOrder ${o._id} • user=${o.userUid} • ${new Date(o.createdAt).toLocaleString()} • total=${o.totalAmount}`
      );

      if (!Array.isArray(o.stockAdjustments) || o.stockAdjustments.length === 0) {
        console.log("  (no stockAdjustments on this order)");
        continue;
      }

      const rows = [];
      for (const a of o.stockAdjustments) {
        const type = String(a.type || "").toLowerCase();
        const Model = MODEL_BY_TYPE[type];

        let name = "";
        let sku = "";
        let stockField = a.usedField || "Stock_admin";
        let currentStock = null;

        if (Model) {
          const doc = await Model.findById(a.productId)
            .select(`Name name SKU sku ${stockField} Stock_admin stock`)
            .lean();

          if (doc) {
            name = doc.Name || doc.name || "";
            sku = doc.SKU || doc.sku || "";
            // prefer the exact field used, else fallbacks
            currentStock =
              doc[stockField] ??
              doc.Stock_admin ??
              doc.stock ??
              null;
          }
        }

        rows.push({
          type,
          productId: a.productId,
          name: name || "(unknown)",
          sku: sku || "",
          changedField: stockField,
          qtyDelta: -Math.abs(a.qty), // order decremented
          currentStock,
        });
      }

      // Pretty print
      const pad = (s, n) => String(s ?? "").toString().padEnd(n);
      console.log(
        "  " +
          [
            pad("type", 10),
            pad("productId", 26),
            pad("name", 24),
            pad("sku", 12),
            pad("field", 12),
            pad("qtyΔ", 6),
            pad("current", 8),
          ].join(" | ")
      );
      console.log(
        "  " + "-".repeat(10) + "-+-" + "-".repeat(26) + "-+-" + "-".repeat(24) + "-+-" + "-".repeat(12) + "-+-" + "-".repeat(12) + "-+-" + "-".repeat(6) + "-+-" + "-".repeat(8)
      );
      for (const r of rows) {
        console.log(
          "  " +
            [
              pad(r.type, 10),
              pad(r.productId, 26),
              pad(r.name, 24),
              pad(r.sku, 12),
              pad(r.changedField, 12),
              pad(r.qtyDelta, 6),
              pad(r.currentStock, 8),
            ].join(" | ")
        );
      }
    }
  } catch (err) {
    console.error("Audit error:", err?.message || err);
    process.exit(1);
  } finally {
    // Close only the default connection we opened
    if (mongoose.connection.readyState) {
      await mongoose.disconnect();
    }
    // Order model uses its own connection; closing default doesn't affect it
  }
})();
