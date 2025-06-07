import express from "express";
import {
  getTiles,
  getBathtubs,
  getGranite,
  getMarble,
  getSinks,
  getToilets
} from "../controllers/productController.js";

const router = express.Router();


router.get("/tiles", getTiles);
router.get("/bathtubs", getBathtubs);
router.get("/granite", getGranite);
router.get("/marble", getMarble);
router.get("/sinks", getSinks);
router.get("/toilets", getToilets);


export default router;
