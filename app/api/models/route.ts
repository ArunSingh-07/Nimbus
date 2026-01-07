import { NextResponse } from "next/server";

type ModelSource = "local" | "cloud" | "google";

export async function GET() {
  const localUrl = process.env.OLLAMA_LOCAL_URL || "http://localhost:11434";
  const cloudUrl = process.env.OLLAMA_CLOUD_URL;
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);

  const fetchModels = async (baseUrl: string, source: "local" | "cloud") => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

      const res = await fetch(`${baseUrl}/api/tags`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) return [];
      const data = await res.json();

      return (data.models || []).map((m: any) => ({
        ...m,
        source,
        displayName: `${m.name} (${source})`,
      }));
    } catch (error) {
      console.warn(`Failed to fetch ${source} models from ${baseUrl}:`, error);
      return [];
    }
  };

  const [localModels, cloudModels] = await Promise.all([
    fetchModels(localUrl, "local"),
    cloudUrl ? fetchModels(cloudUrl, "cloud") : Promise.resolve([]),
  ]);

  const googleModels = hasGemini
    ? [
        {
          name: "gemini-3-flash-preview",
          source: "google" as ModelSource,
          displayName: "Gemini 3 Flash (Preview)",
        },
      ]
    : [];

  const allModels = [...localModels, ...cloudModels, ...googleModels];

  if (allModels.length === 0) {
    return NextResponse.json(
      { error: "No AI models found (Ollama or Gemini)" },
      { status: 500 }
    );
  }

  return NextResponse.json({ models: allModels });
}
