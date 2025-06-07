import mongoose from 'mongoose';

const ToiletsSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  stock: Number,
  size: String
});

export default mongoose.model('Toilets', ToiletsSchema, 'Toilets');
