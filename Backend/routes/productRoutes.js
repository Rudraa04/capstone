// Updated productRoutes.js
import express from "express";
import {
  getProductsByType,
  getProductById,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllProducts,
} from "../controllers/productController.js";

const router = express.Router();

// Get all products combined
router.get("/api/products/all", getAllProducts);

// Generic routes for all product types
router.get("/api/products/:type", getProductsByType);
router.get("/api/products/:type/:id", getProductById);
router.post("/api/products/:type", addProduct);
router.put("/api/products/:type/:id", updateProduct);
router.delete("/api/products/:type/:id", deleteProduct);

export default router;
