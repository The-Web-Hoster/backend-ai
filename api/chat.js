// api/chat.js
export default async function handler(req, res) {
  // Allow CORS so your GitHub Pages frontend can call this
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

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

    // Hugging Face Inference API
    const response = await fetch(
      "https://api-inference.huggingface.co/models/gpt2", // Replace gpt2 with your chosen model
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

    // The generated text is in data[0].generated_text
    res.status(200).json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI request failed" });
  }
}
