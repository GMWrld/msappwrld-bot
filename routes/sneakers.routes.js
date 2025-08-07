const express = require('express');
const router = express.Router();
const { getAllSneakers } = require('../controllers/sneakers.controllers');
const { sendSneakersOnWhatsApp } = require('../controllers/sneakers.controllers');

// GET /sneakers - Get all available sneakers
router.get('/', getAllSneakers);
router.get('/whatsapp', sendSneakersOnWhatsApp);


module.exports = router;

