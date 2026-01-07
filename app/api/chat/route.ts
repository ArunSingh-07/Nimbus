import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

type ChatSource = "local" | "cloud" | "google";

interface ChatRequest {
  message: string;
  history: ChatMessage[];
  model?: string;
  source?: ChatSource;
}

/**
 * Check if a model exists
 */
async function isValidModel(model: string, source: ChatSource = "local"): Promise<boolean> {
  if (source === "google") {
    // Basic validation for known Gemini models
    const validModels = [
      "gemini-1.5-flash", 
      "gemini-1.5-pro", 
      "gemini-2.0-flash-exp",
      "gemini-3-pro-preview",
      "gemini-3-flash-preview"
    ];
    return validModels.includes(model);
  }

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
 * Generate AI response via Gemini
 */
async function generateGeminiResponse(
  messages: ChatMessage[],
  modelName: string
): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key not configured");
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: modelName });

  // Convert history to Gemini format
  // Last message is the new user message, we need separate history and current message
  const historyMessages = messages.slice(0, -1);
  const currentMessage = messages[messages.length - 1];

  /* Retry logic for Gemini */
  const maxRetries = 3;
  let attempt = 0;
  
  const chat = model.startChat({
    history: historyMessages.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }],
    })),
    systemInstruction: {
      role: "system",
      parts: [{ text: `You are a helpful AI coding assistant. You help developers with:
- Code explanations and debugging
- Best practices and architecture advice
- Writing clean, efficient code
- Troubleshooting errors
- Code reviews and optimizations

Always provide clear, practical answers. Use proper code formatting when showing examples.` }]
    }
  });

  while (attempt < maxRetries) {
    try {
      const result = await chat.sendMessage(currentMessage.content);
      return result.response.text();
    } catch (error: any) {
      if (error.status === 429 && attempt < maxRetries - 1) {
        attempt++;
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`Gemini 429 Rate Limit. Retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  
  throw new Error("Max retries exceeded for Gemini API");
}

/**
 * Generate AI response via Ollama
 */
async function generateOllamaResponse(
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
    const selectedModel = model || (source === "google" ? "gemini-1.5-flash" : "codellama:latest");

    // Validate model existence
    const modelExists = await isValidModel(selectedModel, source);
    if (!modelExists) {
      return NextResponse.json(
        {
          error: `Model '${selectedModel}' is not available in ${source}`,
          hint: "Use GET /api/models to list available models",
        },
        { status: 400 }
      );
    }

    let aiResponse: string;

    if (source === "google") {
      aiResponse = await generateGeminiResponse(messages, selectedModel);
    } else {
      aiResponse = await generateOllamaResponse(messages, selectedModel, source);
    }

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
