import mongoose from 'mongoose';

const MarbleSchema = new mongoose.Schema({
  ID: String,
  Name: String,
  Description: String,
  Colour: String,
  Price: Number,
  Image: String,
  Stock_admin: Number,
  Stock_Customer: Boolean,
  Manufracturer: String,
  Size: String
});

export default mongoose.model('Marble', MarbleSchema, 'Marble');
