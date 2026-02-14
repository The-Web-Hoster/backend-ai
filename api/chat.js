export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message" });

    // Using the NEW 2026 Router endpoint with the 'v1' chat format
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "meta-llama/Meta-Llama-3-8B-Instruct",
          messages: [{ role: "user", content: message }],
          max_tokens: 500,
        }),
      }
    );

    const data = await response.json();

    // If Hugging Face returns an error, we catch it here
    if (data.error) {
      console.error("HF Error:", data.error);
      return res.status(200).json({ 
        response: "NEURAL CORE REBOOTING. PLEASE RETRY IN 5 SECONDS." 
      });
    }

    // Extracting text from the OpenAI-style format
    const aiText = data.choices?.[0]?.message?.content || "SYSTEM IDLE.";

    res.status(200).json({ response: aiText });

  } catch (error) {
    console.error("Uplink Error:", error);
    res.status(500).json({ response: "CRITICAL: NEURAL LINK SEVERED." });
  }
}
