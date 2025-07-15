import express from "express";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN;

router.post("/payment", async (req, res) => {
  const { sourceId, amount } = req.body;

  try {
    const response = await axios.post(
      "https://connect.squareupsandbox.com/v2/payments",
      {
        idempotency_key: uuidv4(),
        source_id: sourceId,
        amount_money: {
          amount: amount, // already multiplied by 100 in frontend
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
  }  catch (error) {
  console.error("❌ Payment error:", JSON.stringify(error, null, 2)); // 👈 Full error log
  res.status(500).json({ error: "Payment failed", details: error });
}

  
});

export default router;
