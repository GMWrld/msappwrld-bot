const { fetchSneakerInventory } = require('../services/sneakerServices');

const getAllSneakers = async (req, res) => {
  try {
    const sneakers = await fetchSneakerInventory();
    res.status(200).json({ success: true, data: sneakers });
  } catch (error) {
    console.error('Error fetching sneakers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch sneakers.' });
  }
};

module.exports = {
  getAllSneakers,
};
