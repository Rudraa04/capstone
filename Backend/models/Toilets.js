import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();

const ceramicsConnection = mongoose.createConnection(process.env.CERAMICS_URI);

const ToiletsSchema = new mongoose.Schema({
  name: String,
  Flush_Type: String,
  Color: String, 
  price: Number,
  image: String,
  category: String,
  Subcategory: String,
  Stock_admin: Number,
  Manufacturer: String,
  Size: String
});

export default ceramicsConnection.model('Toilets_Model', ToiletsSchema, 'Toilets_Collection');
