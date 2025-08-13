import { Router } from "express";
import { getLowStock } from "../controllers/inventoryController.js";
const router = Router();

router.get("/low-stock", getLowStock);

export default router;
