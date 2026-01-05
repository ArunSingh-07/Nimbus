# Architecture

## Overview

Nimbus uses a **Next.js** App Router architecture with a **Node.js** backend logic for proxying AI requests.

## Frontend

- **State Management**:
    - `ModelContext` (`components/model-context.tsx`): Stores the list of available models and the currently selected model. Syncs this state across the app.
- **Chat**:
    - `AiChatSidebarPanel` (`modules/ai-chat/components/ai-chat-sidebarpanel.tsx`): Handles chat UI, message history, and interaction. Consumes `ModelContext`.
- **Playground**:
    - `MainPlaygroundPage` (`app/playground/[id]/page.tsx`): Orchestrates the file explorer and editor.
    - `useAISuggestion` (`modules/playground/hooks/useAISuggestion.tsx`): Hook that triggers code completion requests.

## Backend API

The backend acts as a smart proxy/router for Ollama requests.

### 1. `/api/models`
- **Purpose**: Lists all available models from all configured sources.
- **Logic**:
    1.  Fetches tags from `OLLAMA_LOCAL_URL`.
    2.  Fetches tags from `OLLAMA_CLOUD_URL` (if configured).
    3.  Merges lists, tagging them with `source: 'local'` or `source: 'cloud'`.

### 2. `/api/chat`
- **Purpose**: Handles chat generation.
- **Logic**:
    - Receives `model` name and `source` in the request body.
    - Routes the request to the corresponding Ollama URL.
    - Streams the response back to the client.

### 3. `/api/code-completion`
- **Purpose**: Generates inline code suggestions.
- **Logic**:
    - Receives prompt, `model`, and `source`.
    - Routes to the correct Ollama instance.
    - Returns a single generated string (or error message).
