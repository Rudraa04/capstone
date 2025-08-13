// Backend/routes/lowStockRoutes.js
import { Router } from "express";
import { getLowStock } from "../controllers/inventoryController.js";
import { CATEGORY_THRESHOLDS } from "../config/lowStock.js";

const router = Router();

// Middleware to attach thresholds to the request (keeps controller pure)
router.use((req, _res, next) => {
  req.lowStockThresholds = CATEGORY_THRESHOLDS;
  next();
});

// Keep the same path your frontend already calls:
router.get("/low-stock", getLowStock);

export default router;
