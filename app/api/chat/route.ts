import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface ChatRequest {
  message: string;
  history: ChatMessage[];
  model?: string;
  source?: "local" | "cloud";
}

/**
 * Check if a model exists in Ollama
 */
async function isValidModel(model: string, source: "local" | "cloud" = "local"): Promise<boolean> {
  const baseUrl = source === "cloud" 
    ? process.env.OLLAMA_CLOUD_URL 
    : (process.env.OLLAMA_LOCAL_URL || "http://localhost:11434");

  if (!baseUrl) return false;

  try {
    const res = await fetch(`${baseUrl}/api/tags`);
    if (!res.ok) return false;

    const data = await res.json();
    if (!Array.isArray(data?.models)) return false;

    return data.models.some((m: { name: string }) => m.name === model);
  } catch {
    return false;
  }
}

/**
 * Generate AI response via Ollama
 */
async function generateAIResponse(
  messages: ChatMessage[],
  model: string,
  source: "local" | "cloud" = "local"
): Promise<string> {
  const baseUrl = source === "cloud" 
    ? process.env.OLLAMA_CLOUD_URL 
    : (process.env.OLLAMA_LOCAL_URL || "http://localhost:11434");

  if (!baseUrl) {
    throw new Error(`Configuration for ${source} Ollama is missing`);
  }

  const systemPrompt = `You are a helpful AI coding assistant. You help developers with:
- Code explanations and debugging
- Best practices and architecture advice
- Writing clean, efficient code
- Troubleshooting errors
- Code reviews and optimizations

Always provide clear, practical answers. Use proper code formatting when showing examples.`;

  const fullMessage = [{ role: "system", content: systemPrompt }, ...messages];

  const prompt = fullMessage
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n\n");

  const response = await fetch(`${baseUrl}/api/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      prompt,
      stream: false,
      options: {
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 0.9,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Ollama error response:", errorText);
    throw new Error(`Ollama error (${response.status})`);
  }

  const data = await response.json();

  if (!data?.response) {
    throw new Error("No response returned from Ollama");
  }

  return data.response.trim();
}

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { message, history = [], model, source = "local" } = body;

    // Validate input
    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required and must be a string" },
        { status: 400 }
      );
    }

    const validHistory = Array.isArray(history)
      ? history.filter(
          (msg) =>
            msg &&
            typeof msg === "object" &&
            typeof msg.role === "string" &&
            typeof msg.content === "string" &&
            ["user", "assistant"].includes(msg.role)
        )
      : [];

    const recentHistory = validHistory.slice(-10);

    const messages: ChatMessage[] = [
      ...recentHistory,
      { role: "user", content: message },
    ];

    // Model fallback
    const selectedModel = model || "codellama:latest";

    // Validate model existence
    const modelExists = await isValidModel(selectedModel, source);
    if (!modelExists) {
      return NextResponse.json(
        {
          error: `Model '${selectedModel}' is not available in ${source} Ollama`,
          hint: "Use GET /api/models to list available models",
        },
        { status: 400 }
      );
    }

    const aiResponse = await generateAIResponse(messages, selectedModel, source);

    return NextResponse.json({
      response: aiResponse,
      model: selectedModel,
      source: source,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat API Error:", error);

    return NextResponse.json(
      {
        error: "Failed to generate AI response",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
