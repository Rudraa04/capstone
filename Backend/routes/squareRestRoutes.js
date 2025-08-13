import express from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;

// Optional hard cap (e.g., CA$50,000 per payment)
const MAX_PAYMENT_CENTS = 5_000_000;

router.post("/payment", async (req, res) => {
  try {
    const { sourceId, amount } = req.body;
    if (!sourceId) return res.status(400).json({ message: "Missing sourceId" });
    if (amount == null) return res.status(400).json({ message: "Missing amount" });

    // ✅ Trust frontend to send cents. Coerce to integer and validate.
    const amountCents = Math.round(Number(amount));

    if (!Number.isFinite(amountCents) || amountCents < 1) {
      return res.status(400).json({ message: "Invalid amount (must be integer cents ≥ 1)" });
    }
    if (amountCents > MAX_PAYMENT_CENTS) {
      return res.status(400).json({ message: "Amount exceeds per-transaction limit" });
    }

    const response = await axios.post(
      "https://connect.squareupsandbox.com/v2/payments",
      {
        idempotency_key: uuidv4(),
        source_id: sourceId,
        amount_money: {
          amount: amountCents,       // <-- integer cents as-is
          currency: "CAD",
        },
      },
      {
        headers: {
          "Square-Version": "2023-12-13",
          Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("Square response:", response.data);
    res.status(200).json({ message: "Payment successful", result: response.data });
  } catch (err) {
    console.error("Square error:", err.response?.data || err.message);
    res.status(err.response?.status || 500).json(err.response?.data || { message: err.message });
  }
});

export default router;
