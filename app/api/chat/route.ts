import { NextRequest, NextResponse } from "next/server";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface chatRequest {
  message: string;
  history: ChatMessage[];
}

async function generateAIResponse(messages: ChatMessage[]): Promise<string> {
  const systemPrompt = `You are a helpful AI coding assistant. You help developers with:
- Code explanations and debugging
- Best practices and architecture advice  
- Writing clean, efficient code
- Troubleshooting errors
- Code reviews and optimizations

Always provide clear, practical answers. Use proper code formatting when showing examples.`;

  const fullMesssage = [{ role: "system", content: systemPrompt }, ...messages];

  const prompt = fullMesssage
    .map((msg) => `${msg.role}: ${msg.content}`)
    .join("\n\n");

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "codellama:latest",
        prompt: prompt,
        stream: false, //TODO: Implement stream data later on
        options: {
          temperature: 0.7, //controls randomness (0-1)
          max_tokens: 1000, //maximum response length
          top_p: 0.9, //controls diversity
        },
      }),
    });

    const data = await response.json();

    if (!data.response) {
      throw new Error("No response from AI model");
    }

    return data.response.trim();
  } catch (error) {
    console.error("AI generation error", error);
    throw new Error("Failed to generate AI response");
  }
}

export async function POST(req: NextRequest) {
  try {
    const body: chatRequest = await req.json();
    const { message, history = [] } = body;

    //Vlaidate input
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

    //Generate AI response
    const aiResponse = await generateAIResponse(messages);

    return NextResponse.json({
      response: aiResponse,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Chat API Error: ", error);

    const errorMessge =
      error instanceof Error ? error.message : "Unknown Error";

    return NextResponse.json(
      {
        error: "Failed to generate AI response",
        details: errorMessge,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
