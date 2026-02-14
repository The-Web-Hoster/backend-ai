const https = require('https');

export default function handler(req, res) {
  // 1. Set Security Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  // 2. Prepare the AI Command
  const { message } = req.body;
  const postData = JSON.stringify({
    model: "Qwen/Qwen2.5-7B-Instruct", // Reliable 2026 model
    messages: [{ role: "user", content: message }],
    max_tokens: 300
  });

  // 3. Connect to the NEW 2026 Router
  const options = {
    hostname: 'router.huggingface.co',
    path: '/hf-inference/v1/chat/completions',
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.HF_TOKEN}`,
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    },
    timeout: 15000 // 15 seconds to prevent Vercel 500 timeouts
  };

  const request = https.request(options, (response) => {
    let body = '';
    response.on('data', (chunk) => body += chunk);
    response.on('end', () => {
      try {
        const json = JSON.parse(body);
        if (json.error) {
          res.status(200).json({ response: `NEURAL CORE BUSY: ${json.error.message || "Booting..."}` });
        } else {
          const aiText = json.choices?.[0]?.message?.content || "Neural core idle.";
          res.status(200).json({ response: aiText });
        }
      } catch (e) {
        res.status(500).json({ response: "DECODING ERROR: AI BRAIN CORRUPT." });
      }
    });
  });

  request.on('error', (err) => {
    res.status(500).json({ response: `UPLINK SEVERED: ${err.message}` });
  });

  request.write(postData);
  request.end();
}
