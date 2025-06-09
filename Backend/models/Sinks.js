import mongoose from 'mongoose';

const SinksSchema = new mongoose.Schema({
  ID: String,
  Name: String,
  Description: String,
  Colour: String,
  Price: Number,
  Image: String,
  Category: String,
  Stock_admin: Number,
  Stock_Customer: Boolean,
  Manufracturer: String,
  Size: String
});

export default mongoose.model('Sinks', SinksSchema, 'Sinks');
