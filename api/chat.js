// api/chat.js
export default async function handler(req, res) {
  // 1. STRENGTHENED CORS HEADERS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight request
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: "No message provided" });
    }

    // 2. FETCH FROM HUGGING FACE
    const response = await fetch(
      "https://api-inference.huggingface.co/models/gpt2", 
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: message }),
      }
    );

    const data = await response.json();

    // 3. FORMAT THE RESPONSE FOR YOUR WEBSITE
    // Hugging Face returns an array: [{generated_text: "..."}]
    // We transform it into: { response: "..." } so your website can read it easily.
    const aiText = data[0]?.generated_text || data.generated_text || "AI Uplink Stable: No Data.";
    
    res.status(200).json({ response: aiText });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI request failed", details: error.message });
  }
}
