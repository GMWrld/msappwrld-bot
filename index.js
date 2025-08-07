require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { google } = require('googleapis');
const admin = require('firebase-admin');
const { Twilio } = require('twilio');
const sneakersRoutes = require('./routes/sneakers.routes');


const app = express();
app.use(express.json());
app.use(cors());
//clear
// Routes
app.use('/sneakers', sneakersRoutes);

const client = new Twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

// Initialize Firebase
const serviceAccount = require(process.env.FIREBASE_SERVICE_ACCOUNT);
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const db = admin.firestore();

// Setup Google Sheets client
const auth = new google.auth.GoogleAuth({
  keyFile: process.env.GOOGLE_SHEETS_CREDENTIALS_PATH,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});
const sheets = google.sheets({ version: 'v4', auth });

// Utility: fetch sneakers from sheet
async function fetchSneakers(filterBrand) {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.SHEET_ID,
    range: 'Products!A:G' // adjust if columns differ
  });
  const rows = res.data.values || [];
  const headers = rows[0];
  const data = rows.slice(1).map(r => {
    const obj = {};
    headers.forEach((h, i) => {
      obj[h] = r[i] || '';
    });
    return obj;
  });
  if (filterBrand) {
    return data.filter(d => d.Brand.toLowerCase() === filterBrand.toLowerCase() && d.Status.toLowerCase() === 'available');
  }
  return data.filter(d => d.Status.toLowerCase() === 'available');
}

// Twilio webhook for incoming WhatsApp messages
app.post('/webhook', async (req, res) => {
  const incoming = req.body;
  const from = incoming.From; // e.g., whatsapp:+2547...
  const body = (incoming.Body || '').trim();

  console.log('Received:', body, 'from', from);

  // Simple intent: "browse <brand>"
  if (/^browse\s+(.+)/i.test(body)) {
    const brand = body.match(/^browse\s+(.+)/i)[1];
    const sneakers = await fetchSneakers(brand);
    if (sneakers.length === 0) {
      await sendWhatsApp(from, `No available sneakers found for brand "${brand}".`);
    } else {
      for (const s of sneakers.slice(0, 5)) { // limit to first 5
        const msg = `👟 ${s.Name}\n💸 ${s.Price} TZS\n📏 Sizes: ${s.Sizes}\nID: ${s.SneakerID}\nReply with *${s.SneakerID}* to order.`;
        await sendWhatsAppImage(from, s.ImageURL, msg);
      }
    }
  } else if (/^SNK/i.test(body)) {
    // user wants to order by ID
    const sneakers = await fetchSneakers(); // all
    const selected = sneakers.find(s => s.SneakerID.toLowerCase() === body.toLowerCase());
    if (selected) {
      // Create order record in Firestore
      const orderRef = db.collection('orders').doc();
      await orderRef.set({
        sneaker: selected,
        customer: from,
        status: 'pending',
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      await sendWhatsApp(from, `Order received for ${selected.Name}. We will follow up with payment instructions. Order ID: ${orderRef.id}`);
    } else {
      await sendWhatsApp(from, `Could not find a sneaker with ID "${body}".`);
    }
  } else {
    await sendWhatsApp(from, `Welcome to Sneaker Store Bot 👟\nTry: "Browse Nike" or reply with a Sneaker ID to order.`);
  }

  res.sendStatus(200);
});

// Helpers
async function sendWhatsApp(to, text) {
  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to,
    body: text
  });
}

async function sendWhatsAppImage(to, imageUrl, caption) {
  await client.messages.create({
    from: process.env.TWILIO_WHATSAPP_NUMBER,
    to,
    mediaUrl: [imageUrl],
    body: caption
  });
}

app.get('/', (req, res) => res.send('Sneaker Bot is alive'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
