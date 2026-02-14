export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message" });

    // Using the 2026 Router with a fast "Completion" model
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "HuggingFaceH4/zephyr-7b-beta", // Extremely fast & stable
          messages: [{ role: "user", content: message }],
          max_tokens: 150,
          stream: false // Keep it simple
        }),
      }
    );

    const data = await response.json();

    // Check if the AI itself had an error (e.g., Rate Limit)
    if (data.error) {
      return res.status(200).json({ 
        response: `UPLINK BUSY: ${data.error.message || "Model is heating up."}` 
      });
    }

    const aiText = data.choices?.[0]?.message?.content || "SYSTEM IDLE.";
    res.status(200).json({ response: aiText });

  } catch (error) {
    // If we catch an error here, it's a timeout or network crash
    res.status(200).json({ response: "NEURAL LINK STABILIZING... PLEASE RETRY." });
  }
}
