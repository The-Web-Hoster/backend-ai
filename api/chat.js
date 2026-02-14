export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-store, max-age=0");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { message } = req.body;
    
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          // Switching to Llama 3 - High availability in 2026
          model: "meta-llama/Meta-Llama-3-8B-Instruct", 
          messages: [{ role: "user", content: message }],
          max_tokens: 150,
          stream: false
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      // Catching the "Model Loading" status specifically
      return res.status(200).json({ 
        response: "NEURAL CORE LOADING... RETRY IN 5 SECONDS." 
      });
    }

    const aiText = data.choices?.[0]?.message?.content || "Link stable. System idle.";
    res.status(200).json({ response: aiText });

  } catch (error) {
    // This triggers if the 10-second Vercel limit is hit
    res.status(200).json({ response: "NEURAL LINK STABILIZING... TRY AGAIN." });
  }
}
