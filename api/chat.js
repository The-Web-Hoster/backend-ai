export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message" });

    // SWAPPING TO MISTRAL - Much faster and less 'lazy'
    const response = await fetch(
      "https://api-inference.huggingface.co/models/mistralai/Mistral-7B-v0.1",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          inputs: `Human: ${message}\nAI:`, // Giving Mistral a 'Chat' hint
          options: { wait_for_model: true }
        }),
      }
    );

    const data = await response.json();

    // Mistral returns an array with generated_text
    let aiText = "";
    if (Array.isArray(data)) {
      aiText = data[0]?.generated_text || "";
    } else if (data.generated_text) {
      aiText = data.generated_text;
    }

    // Cleaning up the response (Mistral sometimes repeats the prompt)
    aiText = aiText.replace(`Human: ${message}\nAI:`, "").trim();

    if (!aiText) {
      aiText = "NEURAL LINK STABLE. ANALYZING DATA... TRY AGAIN IN 3 SECONDS.";
    }

    res.status(200).json({ response: aiText });

  } catch (error) {
    res.status(500).json({ response: "SYSTEM ERROR: UPLINK SEVERED." });
  }
}
