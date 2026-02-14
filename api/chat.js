export default async function handler(req, res) {
  // 1. SET HEADERS (The permission slip)
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message provided" });

    // 2. CALL A "CHATTIER" MODEL (Blenderbot)
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          inputs: message,
          options: { wait_for_model: true } // Tells the AI: "Wait for me to wake up!"
        }),
      }
    );

    const data = await response.json();

    // 3. CAREFULLY EXTRACT THE TEXT
    // Blenderbot returns text inside data.generated_text or data[0].generated_text
    let aiText = "";
    if (Array.isArray(data) && data[0]?.generated_text) {
      aiText = data[0].generated_text;
    } else if (data.generated_text) {
      aiText = data.generated_text;
    } else {
      aiText = "UPLINK STABLE. NEURAL CORE IDLE.";
    }

    res.status(200).json({ response: aiText });

  } catch (error) {
    console.error("Backend Error:", error);
    res.status(500).json({ response: "CRITICAL UPLINK FAILURE." });
  }
}
