const BASE_URL = import.meta.env.VITE_API_URL || "";

/**
 * Send a message to the Groq AI via the backend proxy.
 * @param {string}   userMessage
 * @param {string}   systemPrompt  – built from current dataset stats
 * @param {string}   [apiKey]      – optional user-supplied key (stored in localStorage)
 * @param {string[]} [history]     – previous {role, content} pairs for context
 * @returns {Promise<string>} AI reply text
 */
export async function askGroq(userMessage, systemPrompt, apiKey = "", history = []) {
  const messages = [
    ...history.slice(-6),            // keep last 3 turns for context
    { role: "user", content: userMessage },
  ];

  const res = await fetch(`${BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages,
      systemPrompt,
      apiKey: apiKey || undefined,
      model: "llama3-70b-8192",       // or mixtral-8x7b-32768, gemma2-9b-it
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.reply;
}

/**
 * Check backend health and whether env key is configured.
 */
export async function checkHealth() {
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    return await res.json();
  } catch {
    return { status: "unreachable" };
  }
}
