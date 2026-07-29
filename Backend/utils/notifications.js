const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sendWhatsAppMessage(phone, body, maxAttempts = 3) {
  if (!process.env.WHATSAPP_PHONE_ID || !process.env.WHATSAPP_ACCESS_TOKEN) {
    throw new Error('WhatsApp credentials not configured');
  }
  if (!phone) throw new Error('Missing destination phone');

  const url = `https://graph.facebook.com/v17.0/${process.env.WHATSAPP_PHONE_ID}/messages`;
  const payload = {
    messaging_product: 'whatsapp',
    to: phone,
    type: 'text',
    text: { body }
  };

  let attempt = 0;
  let lastErr = null;
  while (attempt < maxAttempts) {
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) return data;
      lastErr = new Error('WhatsApp API returned non-OK: ' + JSON.stringify(data));
    } catch (err) {
      lastErr = err;
    }
    attempt += 1;
    await sleep(500 * attempt); // backoff
  }
  throw lastErr || new Error('Unknown WhatsApp send error');
}

module.exports = { sendWhatsAppMessage };
