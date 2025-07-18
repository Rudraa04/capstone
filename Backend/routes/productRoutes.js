// express import to create router
import express from "express";
//all controller logic for handling product logic
import {
  getProductsByType, //fetching all items of a specific product type , comes from controller
  getProductById, //fetching a single product by id and type
  addProduct, // creating a new product for a given type
  updateProduct, // updating product for a given type and id
  deleteProduct, 
  getAllProducts,
} from "../controllers/productController.js";
// creating a new router instance
const router = express.Router();

// Get all products combined /api/products/all
router.get("/api/products/all", getAllProducts);

// route to fetch all products of a specific type /api/products/tiles from mongodb
router.get("/api/products/:type", getProductsByType);
//fetch a single product of a specific type /api/products/tiles/01234
router.get("/api/products/:type/:id", getProductById);
//to add a new product of a specific type POST /api/products/tiles
router.post("/api/products/:type", addProduct);
//to update PUT /api.....
router.put("/api/products/:type/:id", updateProduct);
//to delete DELETE /api....
router.delete("/api/products/:type/:id", deleteProduct);
//for main file
export default router;
