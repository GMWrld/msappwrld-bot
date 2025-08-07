const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

// Sheet details
const SHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Sneakers';

const auth = new GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

async function fetchSneakerInventory() {
  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: SHEET_NAME,
  });

  const rows = response.data.values;

  if (!rows || rows.length === 0) {
    return [];
  }

  const headers = rows[0];
  const sneakers = rows.slice(1).map(row => {
    const sneaker = {};
    headers.forEach((header, index) => {
      sneaker[header] = row[index] ?? '';
    });

    // Normalize fields
    if (sneaker.Price) sneaker.Price = parseFloat(sneaker.Price);
    if (sneaker.Discount) sneaker.Discount = parseFloat(sneaker.Discount);
    if (sneaker.Rate) sneaker.Rate = parseFloat(sneaker.Rate);
    if (sneaker.Stock) sneaker.Stock = parseInt(sneaker.Stock);
    if (sneaker.IsAvailable)
      sneaker.IsAvailable = sneaker.IsAvailable.toLowerCase() === 'true';

    // Parse comma-separated fields into arrays
    if (sneaker.Sizes) {
      sneaker.Sizes = sneaker.Sizes.split(',').map(size => size.trim());
    }
    if (sneaker.Colors) {
      sneaker.Colors = sneaker.Colors.split(',').map(color => color.trim());
    }
    if (sneaker.StyleTags) {
      sneaker.StyleTags = sneaker.StyleTags.split(',').map(tag => tag.trim().toLowerCase());
    }

    return sneaker;
  });

  return sneakers;
}

module.exports = {
  fetchSneakerInventory,
};
