const express = require('express');
const router = express.Router();
const { getAllSneakers } = require('../controllers/sneakers.controller');

// GET /sneakers - Get all available sneakers
router.get('/', getAllSneakers);

module.exports = router;
