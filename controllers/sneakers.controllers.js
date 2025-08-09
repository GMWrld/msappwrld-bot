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
const { sendWhatsAppMessage } = require('../services/whatsappServices');

const sendSneakersOnWhatsApp = async (req, res) => {
//   try {
//     const sneakers = await fetchSneakerInventory();
//     const topSneakers = sneakers.slice(0, 5);

//     let message = `🔥 Sneaker Inventory (${sneakers.length} items):\n\n`;
//     let sneakerImage = '';

//     sneakers.slice(0, 5).forEach((sneaker, index) => {
//     message += `${index + 1}. ${sneaker.Name || 'Unnamed'} - ${sneaker.Brand || 'Unknown'} - $${sneaker.Price || '?'} \n`;
//     // message += `${index + 1}. ${sneaker.Name || 'Unnamed'} - ${sneaker.Brand || 'Unknown'} - $${sneaker.Price || '?'}\n🖼️ Image: ${sneaker.ImageURL || 'No image available'}\n\n`;
//     sneakerImage = '${sneaker.ImageURL || 'No image available'}\n';
//     });

//     message += `\nView full inventory at: ${req.protocol}://${req.get('host')}/sneakers`;

//     await sendWhatsAppMessage(message, sneakerImage);

//     res.status(200).json({ success: true, message: 'Sneakers sent to WhatsApp!' });
//   } 
  try {
    const sneakers = await fetchSneakerInventory();

    const topSneakers = sneakers.slice(0, 5);

    for (const [index, sneaker] of topSneakers.entries()) {
      const caption = `${index + 1}. ${sneaker.Name || 'Unnamed'} - ${sneaker.Brand || 'Unknown'} - $${sneaker.Price || '?'}\n`;

      if (sneaker.ImageURL) {
        await sendWhatsAppMessage(caption, sneaker.ImageURL);
      } else {
        await sendWhatsAppMessage(caption);
      }
    }res.status(200).json({ success: true, message: 'Sneakers sent to WhatsApp!' });
  } 
  catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({ success: false, message: 'Failed to send message.' });
  }
};

//Filter Sneakers Controller
async function filterSneakers(req, res) {
  try {
    let sneakers = await fetchSneakerInventory();

    const { brand, minPrice, maxPrice, gender, discount, style, available } = req.query;

    if (brand) {
      sneakers = sneakers.filter(s => s.Brand?.toLowerCase() === brand.toLowerCase());
    }

    if (minPrice) {
      sneakers = sneakers.filter(s => Number(s.Price) >= Number(minPrice));
    }

    if (maxPrice) {
      sneakers = sneakers.filter(s => Number(s.Price) <= Number(maxPrice));
    }

    if (gender) {
      sneakers = sneakers.filter(s => s.Gender?.toLowerCase() === gender.toLowerCase());
    }

    if (discount === 'true') {
      sneakers = sneakers.filter(s => Number(s.Price) < Number(s.Discount));
    }

    if (style) {
      sneakers = sneakers.filter(s => s.StyleTags?.toLowerCase().includes(style.toLowerCase()));
    }

    if (available === 'true') {
      sneakers = sneakers.filter(s => s.IsAvailable === true && s.Stock > 0);
    }

    res.json(sneakers);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}


module.exports = {
  getAllSneakers,
  sendSneakersOnWhatsApp,
  filterSneakers
};
