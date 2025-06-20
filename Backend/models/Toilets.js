import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();

const ceramicsConnection = mongoose.createConnection(process.env.CERAMICS_URI);

const ToiletsSchema = new mongoose.Schema({
  name: String,
  description: String,
  Color: String, 
  price: Number,
  image: String,
  category: String,
  Stock_admin: Number,
  Stock_Customer: Boolean,
  Manufacturer: String,
});

export default ceramicsConnection.model('Toilets', ToiletsSchema, 'Toilets');
