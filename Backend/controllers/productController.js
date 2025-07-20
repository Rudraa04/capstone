// Updated productController.js

// Import all product models
import Tiles_Model from "../models/Tiles.js";
import Bathtubs_Model from "../models/Bathtubs.js";
import Granite_Model from "../models/Granite.js";
import Marble_Model from "../models/Marble.js";
import Sinks_Model from "../models/Sinks.js";
import Toilets_Model from "../models/Toilets.js";

// Map of product type strings to their Mongoose models
const models = {
  tiles: Tiles_Model,
  bathtubs: Bathtubs_Model,
  granite: Granite_Model,
  marble: Marble_Model,
  sinks: Sinks_Model,
  toilets: Toilets_Model,
};

// ✅ Controller to get all products of a specific type
export const getProductsByType = async (req, res) => {
  const type = req.params.type;
  const Model = models[type];
  if (!Model) return res.status(400).json({ message: "Invalid product type" });

  try {
    const products = await Model.find().lean(); // Returns plain JS objects
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: `Failed to fetch ${type}`, error: err.message });
  }
};

// ✅ Get product by ID
export const getProductById = async (req, res) => {
  const { type, id } = req.params;
  const Model = models[type];
  if (!Model) return res.status(400).json({ message: "Invalid product type" });

  try {
    const product = await Model.findById(id).lean(); // Returns plain JS object
    if (!product) return res.status(404).json({ message: `${type} not found` });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: `Failed to fetch ${type}`, error: err.message });
  }
};

// ✅ Add new product
export const addProduct = async (req, res) => {
  const type = req.params.type;
  const Model = models[type];
  if (!Model) return res.status(400).json({ message: "Invalid product type" });

  try {
    const newItem = new Model(req.body); // Create new product
    const saved = await newItem.save(); // Save to DB
    res.status(201).json({ message: `${saved.name} added successfully`, product: saved });
  } catch (err) {
    res.status(500).json({ message: `Failed to add ${req.body.name || type}`, error: err.message });
  }
};

// ✅ Update product
export const updateProduct = async (req, res) => {
  const { type, id } = req.params;
  const Model = models[type];
  if (!Model) return res.status(400).json({ message: "Invalid product type" });

  try {
    const updated = await Model.findByIdAndUpdate(id, req.body, { new: true }).lean(); // Return updated plain object
    res.status(200).json({ message: "Product updated", product: updated });
  } catch (err) {
    res.status(500).json({ message: `Failed to update ${type}`, error: err.message });
  }
};

// ✅ Delete product
export const deleteProduct = async (req, res) => {
  const { type, id } = req.params;
  const Model = models[type];
  if (!Model) return res.status(400).json({ message: "Invalid product type" });

  try {
    await Model.findByIdAndDelete(id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: `Failed to delete ${type}`, error: err.message });
  }
};

// Get all products from all categories
export const getAllProducts = async (req, res) => {
  try {
    let allProducts = [];

    // Fetch and tag each category — lean() gives plain clean objects
    const tiles = await Tiles_Model.find().lean();
    tiles.forEach(product => { //do it for each product
      allProducts.push({ ...product, category: 'tiles' }); //push everything in that one empty array
    });

    const sinks = await Sinks_Model.find().lean();
    sinks.forEach(product => {
      allProducts.push({ ...product, category: 'sinks' });
    });

    const bathtubs = await Bathtubs_Model.find().lean();
    bathtubs.forEach(product => {
      allProducts.push({ ...product, category: 'bathtubs' });
    });

    const granite = await Granite_Model.find().lean();
    granite.forEach(product => {
      allProducts.push({ ...product, category: 'granite' });
    });

    const marble = await Marble_Model.find().lean();
    marble.forEach(product => {
      allProducts.push({ ...product, category: 'marble' });
    });

    const toilets = await Toilets_Model.find().lean();
    toilets.forEach(product => {
      allProducts.push({ ...product, category: 'toilets' });
    });

    // Return all products from all categories
    res.status(200).json(allProducts);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all products", error: error.message });
  }
};
