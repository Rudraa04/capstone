import mongoose from 'mongoose';

const GraniteSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  stock: Number,
  size: String
});

export default mongoose.model('Granite', GraniteSchema, 'Granite');
