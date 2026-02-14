export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");

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
          model: "Qwen/Qwen2.5-7B-Instruct", 
          messages: [{ role: "user", content: message }],
          max_tokens: 250,
          options: { wait_for_model: true } // THIS IS THE KEY IN 2026
        }),
      }
    );

    const data = await response.json();

    if (data.error) {
      // If it's just loading, we tell the user to wait vs crashing
      return res.status(200).json({ 
        response: "AI IS LOADING COGNITIVE MODULES... SEND AGAIN IN 10 SECONDS." 
      });
    }

    const aiText = data.choices?.[0]?.message?.content || "Connection stable. System idle.";
    res.status(200).json({ response: aiText });

  } catch (error) {
    res.status(200).json({ response: "NEURAL LINK STABILIZING... TRY ONE MORE TIME." });
  }
}
