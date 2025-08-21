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
const sendSneakersOnWhatsApp = async (req, res) => {
  try {
    let sneakers = await fetchSneakerInventory();

    // ✅ Apply filters from query params
    const { brand, gender, priceMin, priceMax, discount } = req.query;

    if (brand) {
      sneakers = sneakers.filter(s => 
        s.Brand && s.Brand.toLowerCase() === brand.toLowerCase()
      );
    }
    if (gender) {
      sneakers = sneakers.filter(s => 
        s.Gender && s.Gender.toLowerCase() === gender.toLowerCase()
      );
    }
    if (priceMin) {
      sneakers = sneakers.filter(s => s.Price >= parseFloat(priceMin));
    }
    if (priceMax) {
      sneakers = sneakers.filter(s => s.Price <= parseFloat(priceMax));
    }
    if (discount) {
      sneakers = sneakers.filter(s => s.Discount >= parseFloat(discount));
    }

    if (!sneakers.length) {
      await sendWhatsAppMessage(`⚠️ No sneakers found matching your filters.`);
      return res.status(404).json({ success: false, message: 'No sneakers found for given filters.' });
    }

    // ✅ Limit to first 5 sneakers to avoid spamming
    const topSneakers = sneakers.slice(0, 5);

    for (const [index, sneaker] of topSneakers.entries()) {
      const caption = `${index + 1}. ${sneaker.Name || 'Unnamed'} - ${sneaker.Brand || 'Unknown'} - $${sneaker.Price || '?'}\n`;

      if (sneaker.ImageURL) {
        await sendWhatsAppMessage(caption, sneaker.ImageURL);
      } else {
        await sendWhatsAppMessage(caption);
      }
    }

    res.status(200).json({ 
      success: true, 
      message: `✅ Sent ${topSneakers.length} sneaker(s) to WhatsApp!`,
      filtersUsed: req.query || {} 
    });

  } catch (error) {
    console.error('Error sending WhatsApp message:', error);
    res.status(500).json({ success: false, message: 'Failed to send WhatsApp messages.' });
  }
};

module.exports = {
  sendSneakersOnWhatsApp
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
