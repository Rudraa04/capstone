// Updated productController.js
//comes from frontend
import Tiles_Model from "../models/Tiles.js";
import Bathtubs_Model from "../models/Bathtubs.js";
import Granite_Model from "../models/Granite.js";
import Marble_Model from "../models/Marble.js";
import Sinks_Model from "../models/Sinks.js";
import Toilets_Model from "../models/Toilets.js";
//object naming product type strings to their mongoose models for easy to use
const models = {
  tiles: Tiles_Model,
  bathtubs: Bathtubs_Model,
  granite: Granite_Model,
  marble: Marble_Model,
  sinks: Sinks_Model,
  toilets: Toilets_Model,
};

// controller to get all products of a specific type
export const getProductsByType = async (req, res) => {
  const type = req.params.type; // extracts product type from url
  const Model = models[type]; //get a model according to type
  //if it doesnt exists - error
  if (!Model) return res.status(400).json({ message: "Invalid product type" });

  try {
    const products = await Model.find(); //fetch all documents model from upper models.
    res.json(products); //returns data as JSON
  } catch (err) {
    res.status(500).json({ message: `Failed to fetch ${type}`, error: err.message });
  }
};

// Get product by ID
export const getProductById = async (req, res) => {
  const { type, id } = req.params;
  const Model = models[type];
  if (!Model) return res.status(400).json({ message: "Invalid product type" });

  try {
    const product = await Model.findById(id);
    if (!product) return res.status(404).json({ message: `${type} not found` });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: `Failed to fetch ${type}`, error: err.message });
  }
};

// Add new product
export const addProduct = async (req, res) => {
  const type = req.params.type;
  const Model = models[type];
  if (!Model) return res.status(400).json({ message: "Invalid product type" });

  try {
    const newItem = new Model(req.body);
    const saved = await newItem.save();
    res.status(201).json({ message: `${saved.name} added successfully`, product: saved });
  } catch (err) {
    res.status(500).json({ message: `Failed to add ${req.body.name || type}`, error: err.message });
  }
};

// Update product
export const updateProduct = async (req, res) => {
  const { type, id } = req.params;
  const Model = models[type];
  if (!Model) return res.status(400).json({ message: "Invalid product type" });

  try {
    const updated = await Model.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json({ message: "Product updated", product: updated });
  } catch (err) {
    res.status(500).json({ message: `Failed to update ${type}`, error: err.message });
  }
};

// Delete product
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

// Controller function to get all products from all categories
export const getAllProducts = async (req, res) => {
  try {
    // Initialize an empty array to store all products
    let allProducts = [];

    // Get all tiles from the database
    const tiles = await Tiles_Model.find();
    // Add each tile to the array and tag it with category "tiles"
    tiles.forEach(product => {
      allProducts.push({ ...product._doc, category: 'tiles' });
    });

    // Get all sinks from the database
    const sinks = await Sinks_Model.find();
    sinks.forEach(product => {
      allProducts.push({ ...product._doc, category: 'sinks' });
    });

    // Get all bathtubs from the database
    const bathtubs = await Bathtubs_Model.find();
    bathtubs.forEach(product => {
      allProducts.push({ ...product._doc, category: 'bathtubs' });
    });

    // Get all granite slabs from the database
    const granite = await Granite_Model.find();
    granite.forEach(product => {
      allProducts.push({ ...product._doc, category: 'granite' });
    });

    // Get all marble slabs from the database
    const marble = await Marble_Model.find();
    marble.forEach(product => {
      allProducts.push({ ...product._doc, category: 'marble' });
    });

    //  Get all toilets from the database
    const toilets = await Toilets_Model.find();
    toilets.forEach(product => {
      allProducts.push({ ...product._doc, category: 'toilets' });
    });

    // Send the combined array of all products as JSON with HTTP status 200
    res.status(200).json(allProducts);

  } catch (error) {
    // If something goes wrong, send a 500 error with message and error details
    res.status(500).json({ 
      message: "Failed to fetch all products", 
      error: error.message 
    });
  }
};