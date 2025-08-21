const express = require('express');
const router = express.Router();
const { 
    getAllSneakers,
    sendSneakersOnWhatsApp,
    filterSneakers
} = require('../controllers/sneakers.controllers');

// GET /sneakers - Get all available sneakers
router.get('/', getAllSneakers);
router.get('/filter', filterSneakers);
router.get('/whatsapp', sendSneakersOnWhatsApp);


module.exports = router;

