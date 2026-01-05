import { NextResponse } from "next/server";

export async function GET() {
  const localUrl = process.env.OLLAMA_LOCAL_URL || "http://localhost:11434";
  const cloudUrl = process.env.OLLAMA_CLOUD_URL;

  const fetchModels = async (baseUrl: string, source: "local" | "cloud") => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout
      
      const res = await fetch(`${baseUrl}/api/tags`, { 
        signal: controller.signal 
      });
      clearTimeout(timeoutId);

      if (!res.ok) return [];
      const data = await res.json();
      
      return (data.models || []).map((m: any) => ({
        ...m,
        source,
        displayName: `${m.name} (${source})`
      }));
    } catch (error) {
      console.warn(`Failed to fetch ${source} models from ${baseUrl}:`, error);
      return [];
    }
  };

  const [localModels, cloudModels] = await Promise.all([
    fetchModels(localUrl, "local"),
    cloudUrl ? fetchModels(cloudUrl, "cloud") : Promise.resolve([])
  ]);

  const allModels = [...localModels, ...cloudModels];

  if (allModels.length === 0) {
    return NextResponse.json(
      { error: "No Ollama models found via Local or Cloud connection" },
      { status: 500 }
    );
  }

  return NextResponse.json({ models: allModels });
}
