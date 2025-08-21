app.post('/webhook/whatsapp', async (req, res) => {
  try {
    const incoming = req.body;
    const from = incoming.From; // e.g. "whatsapp:+2557..."
    const body = (incoming.Body || '').trim();

    console.log(`📩 Received WhatsApp message from ${from}: ${body}`);

    // Pass this to a message processor
    const replyMessages = await processUserMessage(body);

    // Send replies back
    for (const msg of replyMessages) {
      if (msg.image) {
        await sendWhatsAppMessage(msg.text, msg.image, from);
      } else {
        await sendWhatsAppMessage(msg.text, null, from);
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("❌ Webhook error:", err);
    res.sendStatus(500);
  }
});
