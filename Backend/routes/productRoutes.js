import express from "express";
import {
  getTiles,
  getBathtubs,
  getGranite,
  getMarble,
  getSinks,
  getToilets
} from "../controllers/productController.js";

import Marble_Model from "../models/Marble.js";
import Granite_Model from "../models/Granite.js";
import Tiles_Model from "../models/Tiles.js";
import Sinks_Model from "../models/Sinks.js";
import Bathtubs_Model from "../models/Bathtubs.js";
import Toilets_Model from "../models/Toilets.js";

const router = express.Router();

// GET routes
router.get("/api/products/tiles", getTiles);
router.get("/bathtubs", getBathtubs);
router.get("/api/products/granite", getGranite);
router.get("/api/products/marble", getMarble);
router.get("/api/products/sinks", getSinks);
router.get("/api/products/toilets", getToilets);

// POST routes
router.post("/marble", async (req, res) => {
  try {
    const newMarble = new Marble_Model(req.body);
    const saved = await newMarble.save();
    res.status(201).json({ message: `${saved.name} added successfully`, product: saved });
  } catch (err) {
    res.status(500).json({ message: `Failed to add ${req.body.name || "marble"}`, error: err.message });
  }
});

router.post("/granite", async (req, res) => {
  try {
    const newGranite = new Granite_Model(req.body);
    const saved = await newGranite.save();
    res.status(201).json({ message: `${saved.name} added successfully`, product: saved });
  } catch (err) {
    res.status(500).json({ message: `Failed to add ${req.body.name || "granite"}`, error: err.message });
  }
});

router.post("/tiles", async (req, res) => {
  try {
    const newTile = new Tiles_Model(req.body);
    const saved = await newTile.save();
    res.status(201).json({ message: `${saved.name} added successfully`, product: saved });
  } catch (err) {
    res.status(500).json({ message: `Failed to add ${req.body.name || "tile"}`, error: err.message });
  }
});

router.post("/sinks", async (req, res) => {
  try {
    const newSink = new Sinks_Model(req.body);
    const saved = await newSink.save();
    res.status(201).json({ message: `${saved.name} added successfully`, product: saved });
  } catch (err) {
    res.status(500).json({ message: `Failed to add ${req.body.name || "sink"}`, error: err.message });
  }
});

router.post("/bathtubs", async (req, res) => {
  try {
    const newBathtub = new Bathtubs_Model(req.body);
    const saved = await newBathtub.save();
    res.status(201).json({ message: `${saved.name} added successfully`, product: saved });
  } catch (err) {
    res.status(500).json({ message: `Failed to add ${req.body.name || "bathtub"}`, error: err.message });
  }
});

router.post("/toilets", async (req, res) => {
  try {
    const newToilet = new Toilets_Model(req.body);
    const saved = await newToilet.save();
    res.status(201).json({ message: `${saved.name} added successfully`, product: saved });
  } catch (err) {
    res.status(500).json({ message: `Failed to add ${req.body.name || "toilet"}`, error: err.message });
  }
});

// PUT (Edit) routes
router.put("/marble/:id", async (req, res) => {
  try {
    const updated = await Marble_Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Product updated successfully", product: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
});

router.put("/granite/:id", async (req, res) => {
  try {
    const updated = await Granite_Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Product updated successfully", product: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
});

router.get("/api/products/tiles/:id", async (req, res) => {
  try {
    const tile = await Tiles_Model.findById(req.params.id);
    if (!tile) {
      return res.status(404).json({ message: "Tile not found" });
    }
    res.json(tile);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch tile", error: err.message });
  }
});

router.get("/api/products/sinks/:id", async (req, res) => {
  try {
    const sink = await Sinks_Model.findById(req.params.id);
    if (!sink) {
      return res.status(404).json({ message: "Sink not found" });
    }
    res.json(sink);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch sink", error: err.message });
  }
});


router.put("/bathtubs/:id", async (req, res) => {
  try {
    const updated = await Bathtubs_Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Product updated successfully", product: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
});

router.put("/toilets/:id", async (req, res) => {
  try {
    const updated = await Toilets_Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json({ message: "Product updated successfully", product: updated });
  } catch (err) {
    res.status(500).json({ message: "Failed to update product", error: err.message });
  }
});

// DELETE routes
router.delete("/marble/:id", async (req, res) => {
  try {
    await Marble_Model.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
});

router.delete("/granite/:id", async (req, res) => {
  try {
    await Granite_Model.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
});

router.delete("/tiles/:id", async (req, res) => {
  try {
    await Tiles_Model.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
});

router.delete("/sinks/:id", async (req, res) => {
  try {
    await Sinks_Model.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
});

router.delete("/bathtubs/:id", async (req, res) => {
  try {
    await Bathtubs_Model.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
});

router.delete("/toilets/:id", async (req, res) => {
  try {
    await Toilets_Model.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete product", error: err.message });
  }
});

export default router;
