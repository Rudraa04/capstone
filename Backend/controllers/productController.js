import Tiles from "../models/Tiles.js";
import Bathtubs from "../models/Bathtubs.js";
import Granite from "../models/Granite.js";
import Marble from "../models/Marble.js";
import Sinks from "../models/Sinks.js";
import Toilets from "../models/Toilets.js";

export const getTiles = async (req, res) => {
  try {
    const tiles = await Tiles.find();
    res.json(tiles);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getBathtubs = async (req, res) => {
  try {
    const bathtubs = await Bathtubs.find();
    res.json(bathtubs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getGranite = async (req, res) => {
  try {
    const granite = await Granite.find();
    res.json(granite);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getMarble = async (req, res) => {
  try {
    const marble = await Marble.find();
    res.json(marble);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getSinks = async (req, res) => {
  try {
    const sinks = await Sinks.find();
    res.json(sinks);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const getToilets = async (req, res) => {
  try {
    const toilets = await Toilets.find();
    res.json(toilets);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

