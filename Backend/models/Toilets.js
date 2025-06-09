import mongoose from 'mongoose';

const ToiletsSchema = new mongoose.Schema({
  ID: String,
  name: String,
  description: String,
  Colour: String, 
  price: Number,
  image: String,
  category: String,
  Stock_admin: Number,
  Stock_Customer: Boolean,
  Manufracturer: String,
});

export default mongoose.model('Toilets', ToiletsSchema, 'Toilets');
