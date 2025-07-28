// routes/sentiment.js
import express from "express";
import fetch from "node-fetch"; // or use axios

const router = express.Router();

router.post("/", async (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length < 5) {
    return res.status(400).json({ error: "Invalid input" });
  }

  try {
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "Classify the sentiment as Positive, Negative, or Neutral. Return only that word." },
          { role: "user", content: text },
        ],
        temperature: 0,
        max_tokens: 5,
      }),
    });

    const data = await openaiRes.json();
    const result = data.choices?.[0]?.message?.content?.toLowerCase()?.trim();

    return res.json({ sentiment: result || "neutral" });
  } catch (error) {
    console.error("OpenAI error:", error);
    return res.status(500).json({ error: "Failed to analyze sentiment" });
  }
});

export default router;
