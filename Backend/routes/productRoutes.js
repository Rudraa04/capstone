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
import Granite from "../models/Granite.js";
import Tile from "../models/Tiles.js";
import Sink from "../models/Sinks.js";
import Bathtub from "../models/Bathtubs.js";
import Toilet from "../models/Toilets.js";

const router = express.Router();

router.get("/tiles", getTiles);
router.get("/bathtubs", getBathtubs);
router.get("/granite", getGranite);
router.get("/marble", getMarble);
router.get("/sinks", getSinks);
router.get("/toilets", getToilets);

// POST route for adding new marble product
router.post("/marble", async (req, res) => {
  try {
    const newMarble = new Marble(req.body);
    const saved = await newMarble.save();
    res.status(201).json({ message: `${saved.name} added successfully`, product: saved });
  } catch (err) {
    res.status(500).json({ message: `Failed to add ${req.body.name || "marble"}`, error: err.message });
  }
});

// POST route for adding new granite product
router.post("/granite", async (req, res) => {
  try {
    const newGranite = new Granite(req.body);
    const saved = await newGranite.save();
    res.status(201).json({ message: `${saved.name} added successfully`, product: saved });
  } catch (err) {
    res.status(500).json({ message: `Failed to add ${req.body.name || "granite"}`, error: err.message });
  }
});

// POST route for adding new tile product
router.post("/tiles", async (req, res) => {
  try {
    const newTile = new Tile(req.body);
    const saved = await newTile.save();
    res.status(201).json({ message: `${saved.name} added successfully`, product: saved });
  } catch (err) {
    res.status(500).json({ message: `Failed to add ${req.body.name || "tile"}`, error: err.message });
  }
});

// POST route for adding new sink product
router.post("/sinks", async (req, res) => {
  try {
    const newSink = new Sink(req.body);
    const saved = await newSink.save();
    res.status(201).json({ message: `${saved.name} added successfully`, product: saved });
  } catch (err) {
    res.status(500).json({ message: `Failed to add ${req.body.name || "sink"}`, error: err.message });
  }
});

// POST route for adding new bathtub product
router.post("/bathtubs", async (req, res) => {
  try {
    const newBathtub = new Bathtub(req.body);
    const saved = await newBathtub.save();
    res.status(201).json({ message: `${saved.name} added successfully`, product: saved });
  } catch (err) {
    res.status(500).json({ message: `Failed to add ${req.body.name || "bathtub"}`, error: err.message });
  }
});

// POST route for adding new toilet product
router.post("/toilets", async (req, res) => {
  try {
    const newToilet = new Toilet(req.body);
    const saved = await newToilet.save();
    res.status(201).json({ message: `${saved.name} added successfully`, product: saved });
  } catch (err) {
    res.status(500).json({ message: `Failed to add ${req.body.name || "toilet"}`, error: err.message });
  }
});

export default router;
