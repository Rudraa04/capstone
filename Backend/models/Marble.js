import mongoose from "mongoose";
import dotenv from "dotenv";


dotenv.config();
// Use a separate connection for Slabs DB
const slabsConnection = mongoose.createConnection(process.env.SLABS_URI);

const MarbleSchema = new mongoose.Schema({
  Name: String,
  Description: String,
  Color: String,
  Price: Number,
  Image: String,
  Category: String,
  Stock_admin: Number,
  Manufacturer: String,
  Origin: String,
  Size: String
});

// Create model on the slabsConnection
export default slabsConnection.model("Marble_Model", MarbleSchema, "Marble_Collection");
