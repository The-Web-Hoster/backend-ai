export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: "No message" });

    // Function to talk to Hugging Face
    async function queryAI(text) {
      const response = await fetch(
        "https://api-inference.huggingface.co/models/facebook/blenderbot-400M-distill",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.HF_TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ 
            inputs: text,
            options: { wait_for_model: true, use_cache: false }
          }),
        }
      );
      return await response.json();
    }

    let data = await queryAI(message);

    // If the AI returns an error or empty list, wait 2 seconds and try one more time
    if (!data || (Array.isArray(data) && data.length === 0) || data.error) {
        console.log("AI was lazy, retrying...");
        await new Promise(resolve => setTimeout(resolve, 2000));
        data = await queryAI(message);
    }

    // Deep Extract Text
    let aiText = "";
    if (Array.isArray(data)) {
      aiText = data[0]?.generated_text || "";
    } else if (data.generated_text) {
      aiText = data.generated_text;
    }

    // Final check
    if (!aiText || aiText.trim() === "") {
      aiText = "NEURAL LINK STABLE. MODEL IS WAKING UP. PLEASE SEND MESSAGE AGAIN.";
    }

    res.status(200).json({ response: aiText });

  } catch (error) {
    console.error(error);
    res.status(500).json({ response: "SYSTEM ERROR: UPLINK SEVERED." });
  }
}
