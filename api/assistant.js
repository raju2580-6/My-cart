const SYS = `You are the shopping assistant for "my Cart", a service in Nepal where customers send Amazon, Flipkart or other product links and we buy and deliver the item. Customers pay Cash on Delivery. Process: customer submits link, we review and send a price quote in NPR, customer confirms on WhatsApp, we order, ship, and deliver. Answer briefly in the customer's language (Nepali or English). Help compare products and judge whether a link is suitable. Never invent prices, fees, customs rules or delivery dates; for those, tell the customer to ask on WhatsApp support.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const msgs = (req.body?.messages || []).slice(-10).map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: String(m.content).slice(0, 1000) }]
  }));

  while (msgs.length && msgs[0].role !== 'user') msgs.shift();

  if (!msgs.length) return res.status(400).json({ reply: 'Ask me a question.' });

  try {
    const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + process.env.GEMINI_API_KEY;
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYS }] },
        contents: msgs,
        generationConfig: { maxOutputTokens: 500 }
      })
    });
    const d = await r.json();
    res.json({ reply: d.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, please try again.' });
  } catch (e) {
    res.status(500).json({ reply: 'Assistant is unavailable. Please use WhatsApp.' });
  }
}
