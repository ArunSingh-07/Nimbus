import { TemplateFolder } from "@/modules/playground/lib/path-to-json";
import { WebContainer } from "@webcontainer/api";
import { useCallback, useEffect, useRef, useState } from "react";

interface UseWebContainerProps {
  templateData: TemplateFolder | null;
}

interface UseWebContainerReturn {
  serverUrl: string | null;
  isLoading: boolean;
  error: string | null;
  instance: WebContainer | null;
  writeFileSync: (path: string, content: string) => Promise<void>;
  destroy: () => void;
}

export const useWebContainer = ({
  templateData,
}: UseWebContainerProps): UseWebContainerReturn => {
  const [serverUrl, setServerlUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [instance, setInstance] = useState<WebContainer | null>(null);
  const webcontainerRef = useRef<WebContainer | null>(null);

  useEffect(() => {
    let mount = true;
    async function initializeWebContainer() {
      try {
        const webcontainerInstance = await WebContainer.boot();

        if (!mount) {
          webcontainerInstance.teardown();
          return;
        }
        
        webcontainerRef.current = webcontainerInstance;
        setInstance(webcontainerInstance); // Keeping state for UI updates
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize WebContainer: ", error);
        if (mount) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to initialize WebContainer"
          );
          setIsLoading(false);
        }
      }
    }

    initializeWebContainer();

    return () => {
      mount = false;
      if (webcontainerRef.current) {
        webcontainerRef.current.teardown();
        webcontainerRef.current = null;
      }
    };
  }, []);

  const writeFileSync = useCallback(
    async (path: string, content: string): Promise<void> => {
      if (!instance) {
        throw new Error("WebContainer instance is not available");
      }

      try {
        const pathParts = path.split("/");
        const folderPath = pathParts.slice(0, -1).join("/");

        if (folderPath) {
          await instance.fs.mkdir(folderPath, { recursive: true });
        }

        await instance.fs.writeFile(path, content);
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to write file";
        console.error(`Failed to write file at ${path}:`, error);
        throw new Error(`Failed to write file at ${path}: ${errorMessage}`);
      }
    },
    [instance]
  );

  const destroy = useCallback(() => {
    if (instance) {
      instance.teardown();
      setInstance(null);
      setServerlUrl(null);
    }
  }, [instance]);

  return { serverUrl, isLoading, error, instance, writeFileSync, destroy };
};
