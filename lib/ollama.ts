import { Ollama } from "ollama";

export function getLocalOllamaUrl() {
  return process.env.OLLAMA_LOCAL_URL ?? "http://localhost:11434";
}

export function getCloudOllama() {
  if (!process.env.OLLAMA_API_KEY) {
    throw new Error("OLLAMA_API_KEY missing");
  }

  return new Ollama({
    host: "https://ollama.com",
    headers: {
      Authorization: `Bearer ${process.env.OLLAMA_API_KEY}`,
    },
  });
}
