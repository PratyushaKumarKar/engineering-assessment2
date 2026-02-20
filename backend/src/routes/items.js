const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../../data/items.json');

// Utility to read data (intentionally sync to highlight blocking issue)
async function readData() {
  const raw = await fs.readFile(DATA_PATH, 'utf8');
  return JSON.parse(raw);
}

async function writeData(data) {
  await fs.writeFile(DATA_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function parsePositiveInt(value, fallback) {         //PROTECTING AGAINST BAD QUERY VALUES eg negative numbers
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) || parsed < 1 ? fallback : parsed; 
}

function validatePayload(payload) {
  if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
    return { ok: false, error: 'Request body must be a JSON object' };
  }
  const name = typeof payload.name === 'string' ? payload.name.trim() : '';
  const category = typeof payload.category === 'string' ? payload.category.trim() : '';
  const price = Number(payload.price);
  if (!name) {
    return { ok: false, error: 'name is required and must be a non-empty string' };
  }
  if (!category) {
    return { ok: false, error: 'category is required and must be a non-empty string' };
  }
  if (!Number.isFinite(price) || price < 0) {
    return { ok: false, error: 'price is required and must be a number >= 0' };
  }
  return {
    ok: true,
    value: {
      name,
      category,
      price,
    },
  };
}

// GET /api/items?page=1&limit=10&q=desk
router.get('/', async (req, res, next) => {
  try {
    const data = await readData();

    const q = String(req.query.q || '').trim().toLowerCase();
    const page = parsePositiveInt(req.query.page, 1);
    const limit = Math.min(parsePositiveInt(req.query.limit, 10), 100);

    const filtered = q
      ? data.filter(
          (item) =>
            item.name.toLowerCase().includes(q) ||
            item.category.toLowerCase().includes(q)
        )
      : data;

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.min(page, totalPages);

    const start = (safePage - 1) * limit;
    const items = filtered.slice(start, start + limit);

    res.json({
      items,
      pagination: {
        page: safePage,
        limit,
        total,
        totalPages,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/items/:id
router.get('/:id', async (req, res, next) => {
  try {
    const data = await readData();
    const id = Number.parseInt(req.params.id, 10);
    const item = data.find((i) => i.id === id);
    if (!item) {
      const err = new Error('Item not found');
      err.status = 404;
      throw err;
    }
    res.json(item);
  } catch (err) {
    next(err);
  }
});

// POST /api/items
router.post('/', async (req, res, next) => {
  try {
    const validation = validatePayload(req.body);
    if (!validation.ok) {
      return res.status(400).json({ error: validation.error });
    }
    const item = {
      id: Date.now(),
      ...validation.value,
    };
    const data = await readData();
    data.push(item);
    await writeData(data);
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

module.exports = router;