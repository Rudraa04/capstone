// routes/orderRoutes.js
import express from "express";
import mongoose from "mongoose";
import Order from "../models/Orderhistory.js";
import { verifyFirebaseToken } from "../middleware/verifyFirebaseToken.js";

const router = express.Router();


const isValidId = (v) => typeof v === "string" && mongoose.isValidObjectId(v);

const numberish = (v) => (v == null ? v : Number(v));

const ADMIN_UIDS = (process.env.ADMIN_UIDS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// If you want to actually enforce admin, set ENFORCE_ADMIN=true in .env
const ENFORCE_ADMIN = String(process.env.ENFORCE_ADMIN || "").toLowerCase() === "true";

function requireAdmin(req, res, next) {
  if (!ENFORCE_ADMIN) return next(); // not enforcing yet
  const uid = req.user?.uid;
  if (uid && ADMIN_UIDS.includes(uid)) return next();
  return res.status(403).json({ error: "Admin access required" });
}


// Get my orders
router.get("/orders/my", verifyFirebaseToken, async (req, res) => {
  try {
    const orders = await Order.find({ userUid: req.user.uid }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

// Create order
router.post("/orders", verifyFirebaseToken, async (req, res) => {
  try {
    const { items, ...rest } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Order must contain at least one item" });
    }

    // sanitize productId but keep other fields
    const safeItems = items.map((it) => {
      const validId = isValidId(it.productId);
      return {
        ...it,
        productId: validId ? it.productId : undefined,
        sku: !validId && it.productId != null ? String(it.productId) : it.sku,
      };
    });

    const payload = {
      ...rest,
      items: safeItems,
      totalAmount: numberish(rest.totalAmount),
      subtotal: numberish(rest.subtotal),
      discountTotal: numberish(rest.discountTotal),
      taxTotal: numberish(rest.taxTotal),
      shippingFee: numberish(rest.shippingFee),
      status: rest.status || "Paid",
      // you can also accept shippingAddress, payment, timeline from client if you want
    };

    const order = await Order.create({
      userUid: req.user.uid,
      ...payload,
    });

    res.status(201).json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create order" });
  }
});


// List ALL orders (newest first)
router.get("/admin/orders", verifyFirebaseToken, requireAdmin, async (req, res) => {
  try {
    // Basic listing; add pagination if needed via ?page=&limit=
    const orders = await Order.find({}).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch all orders" });
  }
});

// Update status (e.g., mark Delivered) + append timeline + optional tracking
router.patch(
  "/admin/orders/:id/status",
  verifyFirebaseToken,
  requireAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { status, trackingNumber, trackingUrl, note } = req.body;

      if (!isValidId(id)) {
        return res.status(400).json({ error: "Invalid order id" });
      }
      if (!status) {
        return res.status(400).json({ error: "Missing status" });
      }

      const timelineEntry = {
        label: `Status → ${status}`,
        at: new Date(),
      };
      if (note) timelineEntry.note = String(note);

      const update = {
        status,
        $push: { timeline: timelineEntry },
      };

      // Save tracking info if provided
      if (trackingNumber || trackingUrl) {
        update.delivery = {
          ...(trackingNumber ? { trackingNumber } : {}),
          ...(trackingUrl ? { trackingUrl } : {}),
          updatedAt: new Date(),
        };
      }

      const updated = await Order.findByIdAndUpdate(id, update, {
        new: true,
      });

      if (!updated) {
        return res.status(404).json({ error: "Order not found" });
      }

      res.json(updated);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to update order status" });
    }
  }
);

export default router;
