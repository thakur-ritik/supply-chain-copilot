export async function askGroq(userMessage, systemPrompt, apiKey = "", history = []) {
  if (!apiKey) {
    throw new Error("No API key set. Click ⚙ Settings and paste your Groq API key (free at console.groq.com/keys)");
  }

  const messages = [
    ...history.slice(-6),
    { role: "user", content: userMessage },
  ];

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt || "You are a helpful supply chain analyst." },
        ...messages,
      ],
      max_tokens: 1024,
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.choices?.[0]?.message?.content || "No response generated.";
}