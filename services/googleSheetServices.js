const { google } = require('googleapis');
const { GoogleAuth } = require('google-auth-library');

const SHEET_ID = process.env.GOOGLE_SHEET_ID;

const auth = new GoogleAuth({
  credentials: {
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

async function getSheetData(Sneakers) {
  const authClient = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: authClient });

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: Sneakers,
  });

  const rows = res.data.values;
  if (!rows || rows.length === 0) return [];

  const headers = rows[0];
  const data = rows.slice(1).map(row => {
    const rowObj = {};
    headers.forEach((header, i) => {
      rowObj[header] = row[i];
    });
    return rowObj;
  });

  return data;
}

module.exports = {
  getSheetData,
};
