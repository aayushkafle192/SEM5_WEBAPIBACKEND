const express = require('express');
const router = express.Router();
const shippingController = require('../controllers/shippingController');

router.get('/locations', shippingController.getLocations);

module.exports = router;