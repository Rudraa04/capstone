// routes/reports.routes.js
import express from "express";
import Order from "../models/Orderhistory.js"; // your existing schema

const router = express.Router();

// Fetch all customer orders for reports
router.get("/all-orders", async (req, res) => {
  try {
    const orders = await Order.find({});
    res.status(200).json(orders);
  } catch (err) {
    console.error("Failed to fetch orders:", err);
    res.status(500).json({ message: "Error fetching order data" });
  }
});

export default router;
