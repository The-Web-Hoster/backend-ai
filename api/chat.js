export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message" });

    // Try the fastest, most reliable router endpoint first
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "mistralai/Mistral-7B-Instruct-v0.2",
          messages: [{ role: "user", content: message }],
          max_tokens: 100,
        }),
      }
    );

    const data = await response.json();

    // If the new router fails, it usually returns an error object
    if (data.error) {
      return res.status(200).json({ 
        response: "NEURAL CORE REBOOTING. PLEASE RETRY IN 5 SECONDS." 
      });
    }

    // Extracting text from the new OpenAI-style format
    const aiText = data.choices?.[0]?.message?.content || "SYSTEM IDLE.";

    res.status(200).json({ response: aiText });

  } catch (error) {
    console.error("Uplink Error:", error);
    res.status(500).json({ response: "CRITICAL: NEURAL LINK SEVERED." });
  }
}
