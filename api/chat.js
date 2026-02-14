export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message" });

    // FLAN-T5 is extremely fast and rarely 'sleeps'
    const response = await fetch(
      "https://api-inference.huggingface.co/models/google/flan-t5-large",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          inputs: message,
          options: { wait_for_model: true }
        }),
      }
    );

    const data = await response.json();

    // FLAN-T5 returns an array like [{generated_text: "..."}]
    let aiText = "";
    if (Array.isArray(data) && data[0]?.generated_text) {
      aiText = data[0].generated_text;
    } else if (data.generated_text) {
      aiText = data.generated_text;
    }

    if (!aiText) {
      // If we STILL get nothing, check if the API is complaining about the Token
      if (data.error) aiText = `API ERROR: ${data.error}`;
      else aiText = "NEURAL LINK STABLE. BUT THE BRAIN IS EMPTY. RETRYING...";
    }

    res.status(200).json({ response: aiText });

  } catch (error) {
    res.status(500).json({ response: "SYSTEM ERROR: UPLINK SEVERED." });
  }
}
