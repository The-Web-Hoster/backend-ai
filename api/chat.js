export default async function handler(req, res) {
  // 1. Give the browser permission
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") return res.status(200).end();

  try {
    const { message } = req.body;

    // 2. The standard 2026 Router URL
    const response = await fetch(
      "https://router.huggingface.co/hf-inference/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "Qwen/Qwen2.5-7B-Instruct", // Very reliable 2026 model
          messages: [{ role: "user", content: message }],
          max_tokens: 200
        }),
      }
    );

    const data = await response.json();

    // 3. Simple text extraction
    const aiText = data.choices?.[0]?.message?.content || "No response from AI.";

    res.status(200).json({ response: aiText });

  } catch (error) {
    // This sends the EXACT error to your website so you can tell me what it says
    res.status(500).json({ response: `Uplink Error: ${error.message}` });
  }
}
