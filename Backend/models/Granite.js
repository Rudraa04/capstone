import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();


// Use a separate connection for Slabs DB
const slabsConnection = mongoose.createConnection(process.env.SLABS_URI);

const GraniteSchema = new mongoose.Schema({
  Name: String,
  Description: String,
  Color: String,
  Price: Number,
  Image: String,
  SubCategory: String,
  Stock_admin: Number,
  Stock_Customer: Boolean,
  Manufacturer: String,
  Size: String
});

// Create model on the slabsConnection
export default slabsConnection.model("Granite", GraniteSchema, "Granite");
