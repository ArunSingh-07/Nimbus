import { TemplateFolder } from "@/modules/playground/lib/path-to-json";
import { WebContainer } from "@webcontainer/api";
import { useCallback, useEffect, useRef, useState } from "react";

// Global singleton tracker to survive React Strict Mode unmount/remount cycles
let webcontainerInstancePromise: Promise<WebContainer> | null = null;
let teardownTimeout: NodeJS.Timeout | null = null;

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

    // Clear any pending teardown to handle React Strict Mode double-mount
    if (teardownTimeout) {
      clearTimeout(teardownTimeout);
      teardownTimeout = null;
    }

    async function initializeWebContainer() {
      try {
        // If no boot promise exists, create one
        if (!webcontainerInstancePromise) {
          webcontainerInstancePromise = WebContainer.boot();
        }

        const webcontainerInstance = await webcontainerInstancePromise;

        if (!mount) {
          // If unmounted, we don't immediately teardown here relying on the cleanup function's debounce
          return;
        }

        setInstance(webcontainerInstance); // Keeping state for UI updates
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to initialize WebContainer: ", error);
        // If boot failed, clear the promise so we can try again
        webcontainerInstancePromise = null;
        
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
      
      // Schedule teardown with a delay to allow for immediate remounting (Strict Mode / Hot Reload)
      if (!teardownTimeout) {
        teardownTimeout = setTimeout(async () => {
          if (webcontainerInstancePromise) {
            try {
              const instance = await webcontainerInstancePromise;
              instance.teardown();
            } catch (e) {
              console.error("Error tearing down WebContainer:", e);
            }
            webcontainerInstancePromise = null;
            teardownTimeout = null;
          }
        }, 500); // 500ms grace period
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
