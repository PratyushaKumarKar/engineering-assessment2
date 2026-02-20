const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');
const { computeStats } = require('../utils/stats');

let cache = null;
let cachedMtimeMs = 0;
let inFlightRefresh = null;

async function refreshCache() {
  const [raw, stat] = await Promise.all([
    fs.readFile(DATA_PATH, 'utf8'),
    fs.stat(DATA_PATH),
  ]);
  const items = JSON.parse(raw);
  const stats = computeStats(items);
  cache = stats;
  cachedMtimeMs = stat.mtimeMs;
  return stats;
}

// GET /api/stats
router.get('/', async (_req, res, next) => {
  try {
    if (cache) {
      const stat = await fs.stat(DATA_PATH);
      if (stat.mtimeMs === cachedMtimeMs) {
        return res.json(cache);
      }
    }
    if (!inFlightRefresh) {
      inFlightRefresh = refreshCache().finally(() => {
        inFlightRefresh = null;
      });
    }
    const stats = await inFlightRefresh;
    res.json(stats);
  } catch (err) {
    next(err);
  }
});

module.exports = router;