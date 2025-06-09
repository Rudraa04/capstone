import mongoose from 'mongoose';

const MarbleSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  stock: Number,
  size: String
});

export default mongoose.model('Marble', MarbleSchema, 'Marble');
