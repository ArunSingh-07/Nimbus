"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export interface ModelOption {
  name: string;
  source: "local" | "cloud";
  displayName?: string;
}

interface ModelContextType {
  models: ModelOption[];
  selectedModel: ModelOption | null;
  setSelectedModel: (model: ModelOption) => void;
  isLoading: boolean;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelOption | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchModels() {
      try {
        const res = await fetch("/api/models");
        const data = await res.json();
        if (Array.isArray(data?.models)) {
          setModels(data.models);
          // Default to first model if none selected
          if (!selectedModel && data.models.length > 0) {
            // Prefer "code" models if available
            const defaultModel =
              data.models.find((m: any) => m.name.includes("code")) ||
              data.models[0];
            setSelectedModel({
              name: defaultModel.name,
              source: defaultModel.source,
            });
          }
        }
      } catch (error) {
        console.error("Failed to fetch models", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchModels();
  }, [selectedModel]);

  return (
    <ModelContext.Provider
      value={{ models, selectedModel, setSelectedModel, isLoading }}
    >
      {children}
    </ModelContext.Provider>
  );
}

export function useModel() {
  const context = useContext(ModelContext);
  if (context === undefined) {
    throw new Error("useModel must be used within a ModelProvider");
  }
  return context;
}
