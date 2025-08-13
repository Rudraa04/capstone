// Backend/config/lowStock.js
// Central place for category thresholds (override with env if you like)

export const CATEGORY_THRESHOLDS = {
  Tiles:     Number(process.env.LOW_TILES     ?? 30),
  Sinks:     Number(process.env.LOW_SINKS     ?? 3),
  Bathtubs:  Number(process.env.LOW_BATHTUBS  ?? 1),
  Toilets:   Number(process.env.LOW_TOILETS   ?? 4),
  Marble:    Number(process.env.LOW_MARBLE    ?? 4),
  Granite:   Number(process.env.LOW_GRANITE   ?? 5),
};
