"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Loader2,
  Send,
  User,
  Copy,
  X,
  Code,
  Sparkles,
  MessageSquare,
  RefreshCw,
  Settings,
  Zap,
  Brain,
  Search,
  Filter,
  Download,
  ChevronDown,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import "katex/dist/katex.min.css";
import Image from "next/image";
import { useModel } from "@/components/model-context";

// Types for chat messages
interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  id: string;
  timestamp: Date;
  type?: "chat" | "code_review" | "suggestion" | "error_fix" | "optimization";
  tokens?: number;
  model?: string;
}

interface AIChatSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
}

// Types of elements that can be highlighted with keyboard shortcuts
type HighlightTarget =
  | "input"
  | "search"
  | "mode"
  | "model"
  | "messages"
  | null;

// Component to show message type indicator with icon and color coding
const MessageTypeIndicator: React.FC<{
  type?: string;
  model?: string;
  tokens?: number;
}> = ({ type, model, tokens }) => {
  const getTypeConfig = (type?: string) => {
    switch (type) {
      case "code_review":
        return { icon: Code, color: "text-blue-400", label: "Code Review" };
      case "suggestion":
        return {
          icon: Sparkles,
          color: "text-purple-400",
          label: "Suggestion",
        };
      case "error_fix":
        return { icon: RefreshCw, color: "text-red-400", label: "Error Fix" };
      case "optimization":
        return { icon: Zap, color: "text-yellow-400", label: "Optimization" };
      default:
        return { icon: MessageSquare, color: "text-zinc-400", label: "Chat" };
    }
  };

  const config = getTypeConfig(type);
  const Icon = config.icon;

  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-1">
        <Icon className={cn("h-3 w-3", config.color)} />
        <span className={cn("text-xs font-medium", config.color)}>
          {config.label}
        </span>
      </div>
      <div className="flex items-center gap-2 text-xs text-zinc-500">
        {model && <span>{model}</span>}
        {tokens && <span>{tokens} tokens</span>}
      </div>
    </div>
  );
};

export const AIChatSidePanel: React.FC<AIChatSidePanelProps> = ({
  isOpen,
  onClose,
}) => {
  // State management
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chatMode, setChatMode] = useState<
    "chat" | "review" | "fix" | "optimize"
  >("chat");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [autoSave, setAutoSave] = useState(true);
  const [streamResponse, setStreamResponse] = useState(true);
  const [highlight, setHighlight] = useState<HighlightTarget>(null);

  // Model context for AI model selection
  const {
    selectedModel,
    isLoading: isModelLoading,
    models,
    setSelectedModel,
  } = useModel();

  // Refs for DOM elements
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  // Scroll to bottom of messages when new messages arrive
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Auto-scroll when messages or loading state changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom();
    }, 100);
    return () => clearTimeout(timeoutId);
  }, [messages, isLoading]);

  // Add context to user input based on chat mode
  const getChatModePrompt = (mode: string, content: string) => {
    switch (mode) {
      case "review":
        return `Please review this code and provide detailed suggestions for improvement, including performance, security, and best practices:\n\n**Request:** ${content}`;
      case "fix":
        return `Please help fix issues in this code, including bugs, errors, and potential problems:\n\n**Problem:** ${content}`;
      case "optimize":
        return `Please analyze this code for performance optimizations and suggest improvements:\n\n**Code to optimize:** ${content}`;
      default:
        return content;
    }
  };

  // Handle sending a new message to the AI
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    if (!selectedModel) return;

    // Determine message type based on chat mode
    const messageType =
      chatMode === "chat"
        ? "chat"
        : chatMode === "review"
          ? "code_review"
          : chatMode === "fix"
            ? "error_fix"
            : "optimization";

    // Add user message to chat
    const newMessage: ChatMessage = {
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
      id: Date.now().toString(),
      type: messageType,
    };

    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setIsLoading(true);

    try {
      // Add context to message based on chat mode
      const contextualMessage = getChatModePrompt(chatMode, input.trim());

      // Send request to chat API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: contextualMessage,
          history: messages.map(({ role, content }) => ({ role, content })),
          model: selectedModel.name,
          source: selectedModel.source,
          stream: streamResponse,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Add AI response to chat
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.response,
            timestamp: new Date(),
            id: Date.now().toString(),
            type: messageType,
            tokens: data.tokens,
            model: data.model || "AI Assistant",
          },
        ]);
      } else {
        // Handle API error
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "Sorry, I encountered an error. Please try again.",
            timestamp: new Date(),
            id: Date.now().toString(),
          },
        ]);
      }
    } catch (error) {
      // Handle network error
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "Connection error. Please check your internet connection.",
          timestamp: new Date(),
          id: Date.now().toString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Export chat history as JSON file
  const exportChat = () => {
    const chatData = { messages, timestamp: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(chatData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ai-chat-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Highlight UI element briefly (used for keyboard shortcut feedback)
  const triggerHighlight = (target: HighlightTarget, timeout: number = 400) => {
    setHighlight(target);
    setTimeout(() => setHighlight(null), timeout);
  };

  // CSS class for highlighted elements
  const highlightClass =
    "ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-950 animate-pulse";

  // Switch between available AI models
  const switchModel = (direction: "next" | "prev") => {
    if (!selectedModel || models.length === 0) return;
    const currentIndex = models.findIndex(
      (m) => m.name === selectedModel.name && m.source === selectedModel.source,
    );
    if (currentIndex === -1) return;
    const nextIndex =
      direction === "next"
        ? (currentIndex + 1) % models.length
        : (currentIndex - 1 + models.length) % models.length;
    setSelectedModel(models[nextIndex]);
  };

  // Keyboard shortcuts handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Close panel with Escape key
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Only handle Ctrl/Cmd shortcuts
      if (!(e.ctrlKey || e.metaKey)) return;

      switch (e.key.toLowerCase()) {
        case "k":
          e.preventDefault();
          inputRef.current?.focus();
          triggerHighlight("input");
          break;
        case "f":
          e.preventDefault();
          searchRef.current?.focus();
          triggerHighlight("search");
          break;
        case "!":
          if (e.shiftKey) {
            e.preventDefault();
            setChatMode("chat");
            triggerHighlight("mode");
          }
          break;
        case "@":
          if (e.shiftKey) {
            e.preventDefault();
            setChatMode("review");
            triggerHighlight("mode");
          }
          break;
        case "#":
          if (e.shiftKey) {
            e.preventDefault();
            setChatMode("fix");
            triggerHighlight("mode");
          }
          break;
        case "$":
          if (e.shiftKey) {
            e.preventDefault();
            setChatMode("optimize");
            triggerHighlight("mode");
          }
          break;
        case "c":
          if (e.shiftKey) {
            e.preventDefault();
            triggerHighlight("messages");
            setMessages([]);
          }
          break;
        case "e":
          if (e.shiftKey) {
            e.preventDefault();
            triggerHighlight("messages");
            exportChat();
          }
          break;
        case ",":
          if (e.shiftKey) {
            e.preventDefault();
            switchModel("next");
            triggerHighlight("model");
          }
          break;
        case ".":
          if (e.shiftKey) {
            e.preventDefault();
            triggerHighlight("model");
            switchModel("prev");
          }
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, selectedModel, models]);

  // Filter messages based on search term and type filter
  const filteredMessages = messages
    .filter((msg) => {
      if (filterType === "all") return true;
      return msg.type === filterType;
    })
    .filter((msg) => {
      if (!searchTerm) return true;
      return msg.content.toLowerCase().includes(searchTerm.toLowerCase());
    });

  return (
    <TooltipProvider>
      <>
        {/* Backdrop overlay that closes panel when clicked */}
        <div
          className={cn(
            "fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300",
            isOpen ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
          onClick={onClose}
        />

        {/* Main side panel */}
        <div
          className={cn(
            "fixed right-0 top-0 h-full w-full max-w-xl bg-zinc-950 border-l border-zinc-800 z-50 flex flex-col transition-transform duration-300 ease-out shadow-2xl",
            isOpen ? "translate-x-0" : "translate-x-full",
          )}
        >
          {/* Header section with logo, search, and controls */}
          <div className="shrink-0 border-b border-zinc-800 bg-zinc-900/80 backdrop-blur-sm">
            <div className="flex items-center justify-between p-6 gap-2">
              {/* Logo and title */}
              <div className="flex items-center gap-2">
                <div className="relative w-10 h-10 border rounded-full flex flex-col justify-center items-center">
                  <Image src={"/logo.svg"} alt="Logo" width={28} height={28} />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-100">
                    AI Assistant
                  </h2>
                  <p className="text-sm text-zinc-400">
                    {messages.length} messages
                  </p>
                </div>
              </div>

              {/* Search and control buttons with minimal spacing */}
              <div className="flex items-center gap-0.5">
                {/* Search input with icon */}
                <div className="relative">
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-zinc-500" />
                  <Input
                    ref={searchRef}
                    placeholder="Search messages..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={cn(
                      "pl-7 h-8 w-40 bg-zinc-800/50 border-zinc-700/50",
                      highlight === "search" && highlightClass,
                    )}
                  />
                </div>

                {/* Settings dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={cn(
                        "h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800",
                        highlight === "mode" && highlightClass,
                      )}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuCheckboxItem
                      checked={autoSave}
                      onCheckedChange={setAutoSave}
                    >
                      Auto-save conversations
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuCheckboxItem
                      checked={streamResponse}
                      onCheckedChange={setStreamResponse}
                    >
                      Stream responses
                    </DropdownMenuCheckboxItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={exportChat}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Chat
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setMessages([])}>
                      Clear All Messages
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Keyboard shortcuts info tooltip */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-zinc-500 hover:text-zinc-100 hover:bg-zinc-800"
                    >
                      <Info className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent
                    side="bottom"
                    align="end"
                    className="w-64 text-xs leading-relaxed bg-white text-zinc-900 border border-zinc-200 shadow-lg dark:bg-zinc-900 dark:text-zinc-100 dark:border-zinc-700"
                  >
                    <div className="space-y-1">
                      <div className="font-semibold mb-1">
                        Keyboard Shortcuts
                      </div>
                      <div className="flex justify-between">
                        <span>Focus input</span>
                        <kbd className="kbd">Ctrl / ⌘ + K</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Search</span>
                        <kbd className="kbd">Ctrl / ⌘ + F</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Chat mode</span>
                        <kbd className="kbd">Ctrl / ⌘ + 1</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Review mode</span>
                        <kbd className="kbd">Ctrl / ⌘ + 2</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Fix mode</span>
                        <kbd className="kbd">Ctrl / ⌘ + 3</kbd>
                      </div>
                      <div className="flex justify-between">
                        <span>Optimize mode</span>
                        <kbd className="kbd">Ctrl / ⌘ + 4</kbd>
                      </div>
                      <div className="pt-1 border-t border-zinc-200 dark:border-zinc-700">
                        <div className="flex justify-between">
                          <span>Prev model</span>
                          <kbd className="kbd">⇧ + ,</kbd>
                        </div>
                        <div className="flex justify-between">
                          <span>Next model</span>
                          <kbd className="kbd">⇧ + .</kbd>
                        </div>
                      </div>
                    </div>
                  </TooltipContent>
                </Tooltip>

                {/* Close panel button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chat mode and model selection controls */}
            <div className="px-6 pb-4 flex items-center justify-between">
              {/* Chat mode selection dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-zinc-800/60 border-zinc-700 text-zinc-200 flex items-center gap-2"
                  >
                    {chatMode === "chat" && (
                      <MessageSquare className="h-4 w-4" />
                    )}
                    {chatMode === "review" && <Code className="h-4 w-4" />}
                    {chatMode === "fix" && <RefreshCw className="h-4 w-4" />}
                    {chatMode === "optimize" && <Zap className="h-4 w-4" />}
                    <span className="capitalize">{chatMode}</span>
                    <ChevronDown className="h-4 w-4 opacity-60" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  <DropdownMenuItem onClick={() => setChatMode("chat")}>
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Chat
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setChatMode("review")}>
                    <Code className="h-4 w-4 mr-2" />
                    Review Code
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setChatMode("fix")}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Fix Issues
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setChatMode("optimize")}>
                    <Zap className="h-4 w-4 mr-2" />
                    Optimize
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Model selection and filter controls */}
              <div className="flex items-center gap-2">
                {/* AI model selection dropdown */}
                <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
                  <span className="text-zinc-500">Model:</span>
                  <select
                    className={cn(
                      "bg-zinc-800 text-zinc-300 border border-zinc-700 rounded-md text-xs py-1 px-2 focus:outline-none focus:ring-1 focus:ring-zinc-600 cursor-pointer",
                      highlight === "model" && highlightClass,
                    )}
                    value={
                      selectedModel
                        ? `${selectedModel.name}|${selectedModel.source}`
                        : ""
                    }
                    onChange={(e) => {
                      const [name, source] = e.target.value.split("|");
                      const model = models.find(
                        (m) => m.name === name && m.source === source,
                      );
                      if (model && setSelectedModel) setSelectedModel(model);
                    }}
                  >
                    {models.map((model) => (
                      <option
                        key={`${model.source}-${model.name}`}
                        value={`${model.name}|${model.source}`}
                      >
                        {model.name} ({model.source})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Message type filter */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Filter className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setFilterType("all")}>
                      All Messages
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setFilterType("chat")}>
                      Chat Only
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilterType("code_review")}
                    >
                      Code Reviews
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilterType("error_fix")}
                    >
                      Error Fixes
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setFilterType("optimization")}
                    >
                      Optimizations
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Messages container with auto-scroll */}
          <div className="flex-1 overflow-y-auto bg-zinc-950">
            <div
              className={cn(
                "p-6 space-y-6 transition-all",
                highlight === "messages" && highlightClass,
              )}
            >
              {/* Empty state with quick prompts */}
              {filteredMessages.length === 0 && !isLoading && (
                <div className="text-center text-zinc-500 py-16">
                  <div className="relative w-16 h-16 border rounded-full flex flex-col justify-center items-center mx-auto mb-4">
                    <Brain className="h-8 w-8 text-zinc-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-zinc-300">
                    Enhanced AI Assistant
                  </h3>
                  <p className="text-zinc-400 max-w-md mx-auto leading-relaxed mb-6">
                    Advanced AI coding assistant with comprehensive analysis
                    capabilities.
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-w-lg mx-auto">
                    {[
                      "Review my React component for performance",
                      "Fix TypeScript compilation errors",
                      "Optimize database query performance",
                      "Add comprehensive error handling",
                      "Implement security best practices",
                      "Refactor code for better maintainability",
                    ].map((suggestion) => (
                      <button
                        key={suggestion}
                        onClick={() => setInput(suggestion)}
                        className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-sm text-zinc-300 transition-colors text-left cursor-pointer"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Render filtered messages */}
              {filteredMessages.map((msg) => (
                <div key={msg.id} className="space-y-4">
                  <div
                    className={cn(
                      "flex items-start gap-4 group",
                      msg.role === "user" ? "justify-end" : "justify-start",
                    )}
                  >
                    {/* AI avatar for assistant messages */}
                    {msg.role === "assistant" && (
                      <div className="relative w-10 h-10 border rounded-full flex flex-col justify-center items-center">
                        <Brain className="h-5 w-5 text-zinc-400" />
                      </div>
                    )}

                    {/* Message bubble with type indicator */}
                    <div
                      className={cn(
                        "max-w-[85%] rounded-xl shadow-sm",
                        msg.role === "user"
                          ? "bg-zinc-900/70 text-white p-4 rounded-br-md"
                          : "bg-zinc-900/80 backdrop-blur-sm text-zinc-100 p-5 rounded-bl-md border border-zinc-800/50",
                      )}
                    >
                      {/* Show message type for AI responses */}
                      {msg.role === "assistant" && (
                        <MessageTypeIndicator
                          type={msg.type}
                          model={msg.model}
                          tokens={msg.tokens}
                        />
                      )}

                      {/* Render markdown content with code highlighting */}
                      <div className="prose prose-invert prose-sm max-w-none">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm, remarkMath]}
                          rehypePlugins={[rehypeKatex]}
                          components={{
                            code: ({ children, className, ...props }) => {
                              const match = /language-(\w+)/.exec(
                                className || "",
                              );
                              const isInline =
                                !match && !String(children).includes("\n");

                              if (isInline) {
                                return (
                                  <code
                                    className="bg-zinc-800 px-1 py-0.5 rounded text-sm"
                                    {...props}
                                  >
                                    {children}
                                  </code>
                                );
                              }
                              return (
                                <div className="bg-zinc-800 rounded-lg p-4 my-4">
                                  <pre className="text-sm text-zinc-100 overflow-x-auto">
                                    <code className={className} {...props}>
                                      {children}
                                    </code>
                                  </pre>
                                </div>
                              );
                            },
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>

                      {/* Message timestamp and action buttons */}
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-700/30">
                        <div className="text-xs text-zinc-500">
                          {msg.timestamp.toLocaleTimeString()}
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              navigator.clipboard.writeText(msg.content)
                            }
                            className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-200"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setInput(msg.content)}
                            className="h-6 w-6 p-0 text-zinc-400 hover:text-zinc-200"
                          >
                            <RefreshCw className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* User avatar for user messages */}
                    {msg.role === "user" && (
                      <Avatar className="h-9 w-9 border border-zinc-700 bg-zinc-800 shrink-0">
                        <AvatarFallback className="bg-zinc-700 text-zinc-300">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading indicator when waiting for AI response */}
              {isLoading && (
                <div className="flex items-start gap-4 justify-start">
                  <div className="relative w-10 h-10 border rounded-full flex flex-col justify-center items-center">
                    <Brain className="h-5 w-5 text-zinc-400" />
                  </div>
                  <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800/50 p-5 rounded-xl rounded-bl-md flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                    <span className="text-sm text-zinc-300">
                      {chatMode === "review"
                        ? "Analyzing code structure and patterns..."
                        : chatMode === "fix"
                          ? "Identifying issues and solutions..."
                          : chatMode === "optimize"
                            ? "Analyzing performance bottlenecks..."
                            : "Processing your request..."}
                    </span>
                  </div>
                </div>
              )}

              {/* Scroll anchor for auto-scroll */}
              <div ref={messagesEndRef} className="h-1" />
            </div>
          </div>

          {/* Input form at the bottom */}
          <form
            onSubmit={handleSendMessage}
            className="shrink-0 p-4 border-t border-zinc-800 bg-zinc-900/80 backdrop-blur-sm"
          >
            <div className="flex items-end gap-3">
              <div className="flex-1 relative">
                <Textarea
                  ref={inputRef}
                  placeholder={
                    chatMode === "chat"
                      ? "Ask about your code, request improvements, or paste code to analyze..."
                      : chatMode === "review"
                        ? "Describe what you'd like me to review in your code..."
                        : chatMode === "fix"
                          ? "Describe the issue you're experiencing..."
                          : "Describe what you'd like me to optimize..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    // Send message on Enter (without Shift)
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e as any);
                    }
                  }}
                  disabled={isLoading}
                  className={cn(
                    "min-h-11 max-h-32 bg-zinc-800/50 border-zinc-700/50 text-zinc-100 placeholder-zinc-500 focus:border-blue-500 focus:ring-blue-500/20 resize-none pr-20",
                    highlight === "input" && highlightClass,
                  )}
                  rows={1}
                />
                <div className="absolute right-3 bottom-3 flex items-center gap-2">
                  <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs text-zinc-500 bg-zinc-800 border border-zinc-700 rounded">
                    ↵
                  </kbd>
                </div>
              </div>
              <Button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="h-14.5 px-4 bg-zinc-600 hover:bg-zinc-700 text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </>
    </TooltipProvider>
  );
};
