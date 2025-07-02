import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();

const ceramicsConnection = mongoose.createConnection(process.env.CERAMICS_URI);

const BathtubsSchema = new mongoose.Schema({
  Name: String,
  Description: String,
  Color: String,
  Price: Number,
  Image: String,
  Stock_admin: Number,
  Category: String,
  SubCategory: String,
  Manufacturer: String,
  Size: String
});

export default ceramicsConnection.model('Bathtubs_Model', BathtubsSchema, 'Bathtubs_Collection' );
