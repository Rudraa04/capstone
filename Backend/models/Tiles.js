import mongoose from 'mongoose';

const TilesSchema = new mongoose.Schema({
  ID: String,
  Name: String,
  Description: String,
  Colour: String,
  Price: Number,
  Image: String,
  Category: String,
  SubCategory: String,
  Stock_admin: Number,
  Stock_Customer: Boolean,
  Manufracturer: String,
  Size: String
});

export default mongoose.model('Tiles', TilesSchema, 'Tiles');
