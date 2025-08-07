const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

async function sendWhatsAppMessage(body,imageUrl = null, to = process.env.TO_WHATSAPP_NUMBER) {
//   return client.messages.create({
//     from: process.env.TWILIO_PHONE_NUMBER,
//     to,
//     body: body,
//     mediaUrl: [sneakerImage]
//   });
const messageOptions = {
    from: process.env.TWILIO_PHONE_NUMBER,
    to,
    body,
  };

  if (imageUrl) {
    messageOptions.mediaUrl = [imageUrl];
  }

  return client.messages.create(messageOptions);
}

module.exports = { sendWhatsAppMessage };
