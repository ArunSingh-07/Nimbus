"use client";
import React, { useEffect, useState, useRef, Suspense } from "react";
import dynamic from "next/dynamic";

import { transformToWebContainerFormat } from "../hooks/transformer";
import { CheckCircle, Loader2, XCircle, Terminal } from "lucide-react";
import { Progress } from "@/components/ui/progress";

import { WebContainer } from "@webcontainer/api";
import { TemplateFolder, TemplateFile } from "@/modules/playground/lib/path-to-json";
import { findFilePath } from "@/modules/playground/lib";
import { RefreshCw, ExternalLink, Monitor, Tablet, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Dynamically import TerminalComponent with SSR disabled
const TerminalComponent = dynamic(() => import("./terminal"), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col h-full bg-background border rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/50">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
            <div className="w-3 h-3 rounded-full bg-gray-300"></div>
          </div>
          <span className="text-sm font-medium">Loading terminal...</span>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Terminal className="h-8 w-8 text-muted-foreground animate-pulse" />
      </div>
    </div>
  ),
});

interface WebContainerPreviewProps {
  templateData: TemplateFolder;
  serverUrl: string;
  isLoading: boolean;
  error: string | null;
  instance: WebContainer | null;
  writeFileSync: (path: string, content: string) => Promise<void>;
  forceResetup?: boolean;
  activeFile?: TemplateFile;
}

const WebContainerPreview = ({
  templateData,
  error,
  instance,
  isLoading,
  serverUrl,
  writeFileSync,
  forceResetup = false,
  activeFile,
}: WebContainerPreviewProps) => {
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [loadingState, setLoadingState] = useState({
    transforming: false,
    mounting: false,
    installing: false,
    starting: false,
    ready: false,
  });
  const [currentStep, setCurrentStep] = useState(0);
  const totalSteps = 4;
  const [setupError, setSetupError] = useState<string | null>(null);
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [isSetupInProgress, setIsSetupInProgress] = useState(false);

  const [routeMode, setRouteMode] = useState<"base" | "activeFile" | "custom">("base");
  const [customRoute, setCustomRoute] = useState<string>("/");
  const [viewportSize, setViewportSize] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const terminalRef = useRef<any>(null);

  useEffect(() => {
    if (routeMode === "activeFile" && activeFile && templateData) {
      const path = findFilePath(activeFile, templateData);
      if (path) {
        let resolvedRoute = "/";
        if (path.startsWith("app/") || path.startsWith("pages/")) {
          resolvedRoute = "/" + path
            .replace(/^app\//, "")
            .replace(/^pages\//, "")
            .replace(/\/page\.(tsx|jsx|ts|js)$/, "")
            .replace(/page\.(tsx|jsx|ts|js)$/, "")
            .replace(/\.(tsx|jsx|ts|js)$/, "");
          if (resolvedRoute === "") resolvedRoute = "/";
        } else if (path.startsWith("public/")) {
          resolvedRoute = "/" + path.replace(/^public\//, "");
        } else if (path.endsWith(".html")) {
          // Fallback for raw HTML files
          resolvedRoute = "/" + path;
        }
        setCustomRoute(resolvedRoute.startsWith("/") ? resolvedRoute : `/${resolvedRoute}`);
      }
    }
  }, [activeFile, routeMode, templateData]);

  const handleRefresh = () => {
    if (iframeRef.current) {
      iframeRef.current.src = iframeRef.current.src;
    }
  };

  const fullPreviewUrl = previewUrl ? `${previewUrl.replace(/\/$/, "")}${customRoute === "/" ? "" : customRoute}` : "";

  // Reset setup state when forceResetup changes
  useEffect(() => {
    if (forceResetup) {
      setIsSetupComplete(false);
      setIsSetupInProgress(false);
      setPreviewUrl("");
      setCurrentStep(0);
      setLoadingState({
        transforming: false,
        mounting: false,
        installing: false,
        starting: false,
        ready: false,
      });
    }
  }, [forceResetup]);

  useEffect(() => {
    async function setupContainer() {
      if (!instance || isSetupComplete || isSetupInProgress) return;

      try {
        setIsSetupInProgress(true);
        setSetupError(null);

        try {
          const packageJsonExists = await instance.fs.readFile(
            "package.json",
            "utf8"
          );

          // Also check if node_modules exists to ensure we don't skip install on broken state
          let nodeModulesExists = false;
          try {
             await instance.fs.readdir("node_modules");
             nodeModulesExists = true;
          } catch (e) {
            nodeModulesExists = false;
          }

          if (packageJsonExists && nodeModulesExists) {
            // Files are already mounted, just reconnect to existing server
            if (terminalRef.current?.writeToTerminal) {
              terminalRef.current.writeToTerminal(
                "🔄 Reconnecting to existing WebContainer session...\r\n"
              );
            }

            instance.on("server-ready", (port: number, url: string) => {
              if (terminalRef.current?.writeToTerminal) {
                terminalRef.current.writeToTerminal(
                  `🌐 Reconnected to server at ${url}\r\n`
                );
              }

              setPreviewUrl(url);
              setLoadingState((prev) => ({
                ...prev,
                starting: false,
                ready: true,
              }));
            });

            setCurrentStep(4);
            setLoadingState((prev) => ({ ...prev, starting: true }));
            return;
          }
        } catch (error) {}

        // Step-1 transform data
        setLoadingState((prev) => ({ ...prev, transforming: true }));
        setCurrentStep(1);
        // Write to terminal
        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(
            "🔄 Transforming template data...\r\n"
          );
        }

        // @ts-ignore
        const files = transformToWebContainerFormat(templateData);
        setLoadingState((prev) => ({
          ...prev,
          transforming: false,
          mounting: true,
        }));
        setCurrentStep(2);

        //  Step-2 Mount Files

        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(
            "📁 Mounting files to WebContainer...\r\n"
          );
        }
        await instance.mount(files);

        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(
            "✅ Files mounted successfully\r\n"
          );
        }
        setLoadingState((prev) => ({
          ...prev,
          mounting: false,
          installing: true,
        }));
        setCurrentStep(3);

        // Step-3 Install dependencies

        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(
            "📦 Installing dependencies...\r\n"
          );
        }

        const installProcess = await instance.spawn("npm", ["install"]);

        installProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              if (terminalRef.current?.writeToTerminal) {
                terminalRef.current.writeToTerminal(data);
              }
            },
          })
        );

        const installExitCode = await installProcess.exit;

        if (installExitCode !== 0) {
          throw new Error(
            `Failed to install dependencies. Exit code: ${installExitCode}`
          );
        }

        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(
            "✅ Dependencies installed successfully\r\n"
          );
        }

        setLoadingState((prev) => ({
          ...prev,
          installing: false,
          starting: true,
        }));
        setCurrentStep(4);

        // STEP-4 Start The Server

        // Detect script to run
        const pkgJSON = await instance.fs.readFile("package.json", "utf-8");
        const pkg = JSON.parse(pkgJSON);
        const startScript = pkg.scripts?.dev ? "dev" : (pkg.scripts?.start ? "start" : "dev");


        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(
            `🚀 Starting development server with 'npm run ${startScript}'...\r\n`
          );
        }

        const startProcess = await instance.spawn("npm", ["run", startScript]);

        instance.on("server-ready", (port: number, url: string) => {
          if (terminalRef.current?.writeToTerminal) {
            terminalRef.current.writeToTerminal(
              `🌐 Server ready at ${url}\r\n`
            );
          }
          setPreviewUrl(url);
          setLoadingState((prev) => ({
            ...prev,
            starting: false,
            ready: true,
          }));
          setIsSetupComplete(true);
          setIsSetupInProgress(false);
        });

        // Handle start process output - stream to terminal
        startProcess.output.pipeTo(
          new WritableStream({
            write(data) {
              if (terminalRef.current?.writeToTerminal) {
                terminalRef.current.writeToTerminal(data);
              }
            },
          })
        );
      } catch (err) {
        console.error("Error setting up container:", err);
        const errorMessage = err instanceof Error ? err.message : String(err);
        if (terminalRef.current?.writeToTerminal) {
          terminalRef.current.writeToTerminal(`❌ Error: ${errorMessage}\r\n`);
        }
        setSetupError(errorMessage);
        setIsSetupInProgress(false);
        setLoadingState({
          transforming: false,
          mounting: false,
          installing: false,
          starting: false,
          ready: false,
        });
      }
    }

    setupContainer();
  }, [instance, templateData, isSetupComplete, isSetupInProgress]);

  useEffect(() => {
    return () => {};
  }, []);

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md p-6 rounded-lg bg-gray-50 dark:bg-gray-900">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />
          <h3 className="text-lg font-medium">Initializing WebContainer</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Setting up the environment for your project...
          </p>
        </div>
      </div>
    );
  }

  if (error || setupError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 p-6 rounded-lg max-w-md">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="h-5 w-5" />
            <h3 className="font-semibold">Error</h3>
          </div>
          <p className="text-sm">{error || setupError}</p>
        </div>
      </div>
    );
  }

  const getStepIcon = (stepIndex: number) => {
    if (stepIndex < currentStep) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (stepIndex === currentStep) {
      return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    } else {
      return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepText = (stepIndex: number, label: string) => {
    const isActive = stepIndex === currentStep;
    const isComplete = stepIndex < currentStep;

    return (
      <span
        className={`text-sm font-medium ${
          isComplete
            ? "text-green-600"
            : isActive
              ? "text-blue-600"
              : "text-gray-500"
        }`}
      >
        {label}
      </span>
    );
  };

  return (
    <div className="h-full w-full flex flex-col">
      {!previewUrl ? (
        <div className="h-full flex flex-col">
          <div className="w-full max-w-md p-6 m-5 rounded-lg bg-white dark:bg-zinc-800 shadow-sm mx-auto">
            <Progress
              value={(currentStep / totalSteps) * 100}
              className="h-2 mb-6"
            />

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                {getStepIcon(1)}
                {getStepText(1, "Transforming template data")}
              </div>
              <div className="flex items-center gap-3">
                {getStepIcon(2)}
                {getStepText(2, "Mounting files")}
              </div>
              <div className="flex items-center gap-3">
                {getStepIcon(3)}
                {getStepText(3, "Installing dependencies")}
              </div>
              <div className="flex items-center gap-3">
                {getStepIcon(4)}
                {getStepText(4, "Starting development server")}
              </div>
            </div>
          </div>

          {/* Terminal */}
          <div className="flex-1 p-4">
            <TerminalComponent
              ref={terminalRef}
              webContainerInstance={instance}
              theme="dark"
              className="h-full"
            />
          </div>
        </div>
      ) : (
        <div className="h-full flex flex-col bg-background overflow-hidden">
          {/* Mini Browser Toolbar */}
          <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/40 gap-2 shrink-0 overflow-hidden">
            <div className="flex items-center gap-1 shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleRefresh}>
                      <RefreshCw className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Refresh Preview</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 text-xs font-medium px-2">
                    {routeMode === "base" && "Base Route"}
                    {routeMode === "activeFile" && "Sync with File"}
                    {routeMode === "custom" && "Custom Route"}
                    <span className="ml-1 text-[10px]">▼</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => { setRouteMode("base"); setCustomRoute("/"); }}>
                    Base Route (/)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRouteMode("activeFile")}>
                    Sync with Active File
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setRouteMode("custom")}>
                    Custom Route
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Address Bar */}
            <div className="flex-1 min-w-0 max-w-lg mx-auto flex items-center bg-background border rounded-md px-2 h-7 focus-within:ring-1 focus-within:ring-ring">
              <span className="text-muted-foreground text-xs mr-1 truncate hidden sm:inline max-w-[150px] md:max-w-xs">{previewUrl.replace(/\/$/, "")}</span>
              <input
                className="flex-1 bg-transparent border-none outline-none text-xs text-foreground min-w-[50px] font-mono"
                value={customRoute}
                onChange={(e) => {
                  setRouteMode("custom");
                  let val = e.target.value;
                  if (!val.startsWith("/")) val = "/" + val;
                  setCustomRoute(val);
                }}
                placeholder="/"
              />
            </div>

            {/* Viewport Toggles and External Link */}
            <div className="flex items-center gap-1 shrink-0">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className={`h-7 w-7 ${viewportSize === "mobile" ? "bg-muted" : ""}`} onClick={() => setViewportSize("mobile")}>
                      <Smartphone className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Mobile View</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className={`h-7 w-7 ${viewportSize === "tablet" ? "bg-muted" : ""}`} onClick={() => setViewportSize("tablet")}>
                      <Tablet className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Tablet View</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className={`h-7 w-7 ${viewportSize === "desktop" ? "bg-muted" : ""}`} onClick={() => setViewportSize("desktop")}>
                      <Monitor className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Desktop View</TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <div className="w-px h-4 bg-border mx-1"></div>

              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => window.open(fullPreviewUrl, '_blank')}>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Open in New Tab</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>

          <div className="flex-1 relative bg-muted/20 flex items-center justify-center overflow-auto">
            <div className={`transition-all duration-300 ease-in-out bg-background ${
              viewportSize === 'mobile' ? 'w-[375px] h-[812px] rounded-[2rem] border-[min(1rem,4vw)] border-slate-800 shadow-xl my-4 shrink-0' : 
              viewportSize === 'tablet' ? 'w-[768px] h-[1024px] rounded-lg border border-border shadow-lg my-4 shrink-0' : 
              'w-full h-full border-none'
            }`}>
              <iframe
                ref={iframeRef}
                src={fullPreviewUrl}
                className={`w-full h-full border-none ${viewportSize !== 'desktop' ? 'rounded-md' : ''}`}
                title="WebContainer Preview"
              />
            </div>
          </div>

          <div className="h-48 border-t shrink-0">
            <TerminalComponent
              ref={terminalRef}
              webContainerInstance={instance}
              theme="dark"
              className="h-full"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default WebContainerPreview;
