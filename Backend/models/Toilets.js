import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();

const ceramicsConnection = mongoose.createConnection(process.env.CERAMICS_URI);

const ToiletsSchema = new mongoose.Schema({
  Name: String,
  Description: String,
  Category: String,
  FlushType: { type: String, default: "" } , 
  Color: String,
  Price: Number,
  Stock_admin: Number,
  Manufacturer: String,
  Size: String,
  Image: String,
  SubCategory: String,
});


export default ceramicsConnection.model('Toilets_Model', ToiletsSchema, 'Toilets_Collection');
