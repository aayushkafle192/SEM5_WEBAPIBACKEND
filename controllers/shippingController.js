const DeliveryLocation = require('../models/DeliveryLocationModel');

exports.getLocations = async (req, res) => {
  try {
    const locations = await DeliveryLocation.find({}).sort({ district: 1, name: 1 });
    res.json(locations);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shipping locations.' });
  }
};