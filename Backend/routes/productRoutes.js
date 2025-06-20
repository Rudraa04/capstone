import express from "express";
import {
  getTiles,
  getBathtubs,
  getGranite,
  getMarble,
  getSinks,
  getToilets
} from "../controllers/productController.js";

import Marble from "../models/Marble.js";

const router = express.Router();



router.get("/tiles", getTiles);
router.get("/bathtubs", getBathtubs);
router.get("/granite", getGranite);
router.get("/marble", getMarble);
router.get("/sinks", getSinks);
router.get("/toilets", getToilets);

//POST route for adding new marble product from admin panel
router.post("/marble", async (req, res) => {
  try {
    const newMarble = new Marble(req.body);
    const savedMarble = await newMarble.save();
    res.status(201).json({ message: "Marble product added", product: savedMarble });
  }
   catch (err)
 {
    console.error(err);
    res.status(500).json({ message: "Failed to add marble", error: err.message });
  }
});

export default router;
