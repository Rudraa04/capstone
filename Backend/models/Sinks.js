import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();

const ceramicsConnection = mongoose.createConnection(process.env.CERAMICS_URI);

const SinksSchema = new mongoose.Schema({
  Name: String,
  Description: String,
  Color: String,
  Price: Number,
  Image: String,
  Category: String,
  SubCategory: String,
  Stock_admin: Number,
  Manufacturer: String,
  Size: String
});

export default ceramicsConnection.model('Sinks_Model', SinksSchema, 'Sinks_Collection');
