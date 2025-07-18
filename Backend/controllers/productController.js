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

// Get all products combined
export const getAllProducts = async (req, res) => {
  try {
    const results = await Promise.all(
      Object.entries(models).map(async ([type, Model]) => {
        const items = await Model.find();
        return items.map(item => ({ ...item._doc, category: type }));
      })
    );
    const allProducts = results.flat();
    res.status(200).json(allProducts);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch all products", error: error.message });
  }
};
