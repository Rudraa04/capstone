import Tiles_Model from "../models/Tiles.js";
import Bathtubs_Model from "../models/Bathtubs.js";
import Granite_Model from "../models/Granite.js";
import Marble_Model from "../models/Marble.js";
import Sinks_Model from "../models/Sinks.js";
import Toilets_Model from "../models/Toilets.js";

export const getTiles = async (req, res) => {
  try {
    const tiles = await Tiles_Model.find();
    res.json(tiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getBathtubs = async (req, res) => {
  try {
    const bathtubs = await Bathtubs_Model.find();
    res.json(bathtubs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getGranite = async (req, res) => {
  try {
    const granite = await Granite_Model.find();
    res.json(granite);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getMarble = async (req, res) => {
  try {
    const marble = await Marble_Model.find();
    res.json(marble);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getSinks = async (req, res) => {
  try {
    const sinks = await Sinks_Model.find();
    res.json(sinks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getToilets = async (req, res) => {
  try {
    const toilets = await Toilets_Model.find();
    res.json(toilets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const updateMarble = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await Marble_Model.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      return res.status(404).json({ message: "Marble product not found" });
    }

    res.status(200).json(updated);
  } catch (err) {
    console.error("Error updating marble:", err);
    res.status(500).json({ message: "Failed to update marble product", error: err.message });
  }
};

