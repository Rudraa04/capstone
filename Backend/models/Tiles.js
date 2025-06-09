import mongoose from 'mongoose';

const TilesSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  image: String,
  category: String,
  stock: Number,
  size: String
});

export default mongoose.model('Tiles', TilesSchema, 'Tiles');
