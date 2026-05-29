type ChatMessage = {
  role?: string;
  content?: string;
};

type Env = {
  HELP_AGENT_URL?: string;
  HELP_AGENT_MODEL?: string;
};

const defaultModel = "hf.co/LiquidAI/LFM2.5-8B-A1B-GGUF:Q4_K_M";
const systemPrompt = `You are Hack, the DefendableDatasets support assistant.
Help users understand dataset graph browsing, registry filters, receipts, SHA256 hashes, access requests, pack exports, Quality Foundry, and contribution workflow.
Be concise, practical, and honest. Do not claim file access, account access, or live backend access unless the user provides it.
Do not reveal private infrastructure details. If asked about downloads, explain that public metadata is open and file delivery is gated by policy.
Answer in 1-4 short paragraphs.`;

export async function onRequestPost(context: { request: Request; env: Env }) {
  const body = await context.request.json().catch(() => null) as { message?: string; history?: ChatMessage[] } | null;
  const message = body?.message?.trim().slice(0, 800);
  if (!message) return json({ error: "Question required." }, 400);

  const baseUrl = context.env.HELP_AGENT_URL?.replace(/\/$/, "");
  if (!baseUrl) {
    return json({
      error: "Hack is not connected yet. Set HELP_AGENT_URL in Cloudflare Pages to the Ollama-compatible agent endpoint.",
    }, 503);
  }

  const prompt = buildPrompt(message, body?.history ?? []);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    const response = await fetch(`${baseUrl}/api/generate`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        model: context.env.HELP_AGENT_MODEL || defaultModel,
        prompt,
        stream: false,
        options: {
          temperature: 0.2,
          num_predict: 320,
        },
      }),
      signal: controller.signal,
    });
    const data = await response.json().catch(() => ({})) as { response?: string; error?: string };
    if (!response.ok || data.error) return json({ error: data.error || "Help agent request failed." }, 502);
    return json({ answer: sanitizeAnswer(data.response || "") });
  } catch {
    return json({ error: "Hack timed out or is unreachable." }, 504);
  } finally {
    clearTimeout(timeout);
  }
}

export async function onRequestGet() {
  return json({ ok: true, service: "DefendableDatasets Hack support proxy" });
}

function buildPrompt(message: string, history: ChatMessage[]) {
  const recent = history
    .slice(-6)
    .map((item) => `${item.role === "user" ? "User" : "Hack"}: ${(item.content || "").slice(0, 800)}`)
    .join("\n");
  return `${systemPrompt}\n\nRecent conversation:\n${recent}\n\nUser: ${message}\nHack:`;
}

function sanitizeAnswer(answer: string) {
  const withoutThinking = answer.replace(/<think>[\s\S]*?<\/think>/gi, "").trim();
  return withoutThinking || "I can help with datasets, receipts, access, and pack exports.";
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}

