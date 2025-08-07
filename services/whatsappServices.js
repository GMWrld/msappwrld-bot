const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendWhatsAppMessage(body, to = process.env.TO_WHATSAPP_NUMBER) {
  return client.messages.create({
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
    body,
  });
}

module.exports = { sendWhatsAppMessage };
