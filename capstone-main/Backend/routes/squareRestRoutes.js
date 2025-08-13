import express from "express"; /// Express helps us create routes (APIs)
import axios from "axios"; //to call square API
import { v4 as uuidv4 } from "uuid"; //this generates a unique id for each payment (prevent duplicate payments)
import dotenv from "dotenv"; //to use environment variables

dotenv.config(); // to start using environment variables
const router = express.Router(); // create a new router instance

const SQUARE_ACCESS_TOKEN = process.env.SQUARE_ACCESS_TOKEN; //get the Square access token from environment variables

router.post("/payment", async (req, res) => { // handle payment requests from the frontend
  const { sourceId, amount } = req.body; // get sourceId and amount from the request

  try {
    const response = await axios.post(
      "https://connect.squareupsandbox.com/v2/payments", // use axios to make a POST request to Square's sandbox  API
      {
        idempotency_key: uuidv4(), // create a unique id to prevent duplicate payments
        source_id: sourceId,  // from frontend
        amount_money: {
          amount: amount, // already multiplied by 100 in frontend
          currency: "CAD", 
        },
      },
      { //extra information for the request to Square to avoid errors
        headers: {
          "Square-Version": "2023-12-13", // exact version of Square API we are using
          Authorization: `Bearer ${SQUARE_ACCESS_TOKEN}`, // use the Square access token for authorization
          "Content-Type": "application/json",//tell Square that we are sending JSON data
        },
      }
    );

    console.log("Square response:", response.data); // log the response from Square for debugging
    res.status(200).json({ message: "Payment successful", result: response.data }); // send a success response back to the frontend
  }  catch (error) {
  console.error("Payment error:", JSON.stringify(error, null, 2)); // Log the error details
  res.status(500).json({ error: "Payment failed", details: error }); // Send an error response back to the frontend
}

  
});

export default router; // export the router so it can be used in server.js to set up the route
