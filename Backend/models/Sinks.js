import mongoose from 'mongoose';

const SinksSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  stock: Number,
  size: String
});

export default mongoose.model('Sinks', SinksSchema, 'Sinks');
