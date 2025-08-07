// Fetch All Sneakers Contorller
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


// WhatsApp Controller
const { sendWhatsAppMessage } = require('../services/whatsappService');

const sendSneakersOnWhatsApp = async (req, res) => {
  try {
    const sneakers = await fetchSneakerInventory();

    let message = `🔥 Sneaker Inventory (${sneakers.length} items):\n\n`;

    sneakers.slice(0, 5).forEach((sneaker, index) => {
      message += `${index + 1}. ${sneaker.Name || 'Unnamed'} - ${sneaker.Brand || 'Unknown'} - $${sneaker.Price || '?'}\n`;
    });

    message += `\nView full inventory at: ${req.protocol}://${req.get('host')}/sneakers`;

    await sendWhatsAppMessage(message);

    res.status(200).json({ success: true, message: 'Sneakers sent to WhatsApp!' });
  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
};

module.exports = {
  getAllSneakers,
  sendSneakersOnWhatsApp,
};
