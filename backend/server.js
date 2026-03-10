require("dotenv").config();
const express = require("express");
const cors = require("cors");
const Groq = require("groq-sdk");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  methods: ["GET", "POST"],
}));
app.use(express.json({ limit: "2mb" }));

const getGroqClient = (apiKey) => {
  const key = apiKey || process.env.GROQ_API_KEY;
  if (!key) throw new Error("No Groq API key provided.");
  return new Groq({ apiKey: key });
};

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", hasEnvKey: !!process.env.GROQ_API_KEY });
});

app.post("/api/chat", async (req, res) => {
  const { messages, systemPrompt, apiKey } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }
  try {
    const groq = getGroqClient(apiKey);
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt || "You are a helpful supply chain analyst." },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.4,
    });
    const reply = completion.choices?.[0]?.message?.content || "No response generated.";
    res.json({ reply });
  } catch (err) {
    console.error("Groq error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🚀 Backend running on http://localhost:${PORT}`);
  console.log(`   Model:   llama-3.3-70b-versatile`);
  console.log(`   API Key: ${process.env.GROQ_API_KEY ? "✅ loaded" : "⚠ not set"}\n`);
});