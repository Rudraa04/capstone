import mongoose from 'mongoose';

const GraniteSchema = new mongoose.Schema({
  ID: String,
  Name: String,
  Description: String,
  Colour: String,
  Price: Number,
  Image: String,
  SubCategory: String,
  Stock_admin: Number,
  Stock_Customer: Boolean,
  Manufracturer: String,
  Size: String
});

export default mongoose.model('Granite', GraniteSchema, 'Granite');
