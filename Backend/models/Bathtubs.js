import mongoose from 'mongoose';

const BathtubsSchema = new mongoose.Schema({
  ID: String,
  Name: String,
  Description: String,
  Color: String,
  Price: Number,
  Image: String,
  Stock_admin: Number,
  Stock_Customer: Boolean,
  Manufacturer: String,
  Size: String
});

export default mongoose.model('Bathtubs', BathtubsSchema, 'Bathtubs' );
