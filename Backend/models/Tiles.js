import mongoose from 'mongoose';
import dotenv from "dotenv";
dotenv.config();
// Creating a dedicated connection to the MongoDB database for ceramics
const ceramicsConnection = mongoose.createConnection(process.env.CERAMICS_URI);
//defined a schema for tiles_collection
const TilesSchema = new mongoose.Schema({
  Name: String ,
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
// Exporting a Mongoose model for the Tiles collection
//to backend to perform CRUD
export default ceramicsConnection.model('Tiles_Model', TilesSchema, 'Tiles_Collection');
