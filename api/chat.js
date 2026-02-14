export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message" });

    // Using the NEW Router URL as requested by the error message
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/models/google/flan-t5-large",
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

    let aiText = "";
    if (Array.isArray(data)) {
      aiText = data[0]?.generated_text || "";
    } else if (data.generated_text) {
      aiText = data.generated_text;
    }

    if (!aiText) {
      // If there's an error in the response, show it so we can debug
      aiText = data.error ? `MODEL ERROR: ${data.error}` : "NEURAL LINK STABLE. ANALYZING...";
    }

    res.status(200).json({ response: aiText });

  } catch (error) {
    res.status(500).json({ response: "SYSTEM ERROR: UPLINK SEVERED." });
  }
}
