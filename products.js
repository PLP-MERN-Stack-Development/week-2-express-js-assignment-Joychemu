const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
let products = require('../data/products');
const validateProduct = require('../middleware/validateProduct');
const { NotFoundError } = require('../utils/errors');

router.get('/', (req, res) => {
  let result = products;

  if (req.query.category) {
    result = result.filter(p => p.category === req.query.category);
  }

  if (req.query.search) {
    const term = req.query.search.toLowerCase();
    result = result.filter(p => p.name.toLowerCase().includes(term));
  }

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || result.length;
  const start = (page - 1) * limit;
  const end = start + limit;

  res.json({
    total: result.length,
    page,
    limit,
    products: result.slice(start, end),
  });
});

router.get('/:id', (req, res, next) => {
  const product = products.find(p => p.id === req.params.id);
  if (!product) return next(new NotFoundError('Product not found'));
  res.json(product);
});

router.post('/', validateProduct, (req, res) => {
  const newProduct = { id: uuidv4(), ...req.body };
  products.push(newProduct);
  res.status(201).json(newProduct);
});

router.put('/:id', validateProduct, (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return next(new NotFoundError('Product not found'));
  products[index] = { ...products[index], ...req.body };
  res.json(products[index]);
});

router.delete('/:id', (req, res, next) => {
  const index = products.findIndex(p => p.id === req.params.id);
  if (index === -1) return next(new NotFoundError('Product not found'));
  products.splice(index, 1);
  res.status(204).send();
});

router.get('/stats/count-by-category', (req, res) => {
  const stats = {};
  products.forEach(p => {
    stats[p.category] = (stats[p.category] || 0) + 1;
  });
  res.json(stats);
});

module.exports = router;