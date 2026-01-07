# Setup Guide

## Prerequisites

- **Node.js**: v18 or later.
- **Ollama**: Required for local AI models. [Download Ollama](https://ollama.com).

## Installation

1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

## Configuration

1.  Copy `.env.example` to `.env.local` (or create a new file):
    ```bash
    cp .env.example .env.local
    ```

2.  Configure your Ollama URLs in `.env.local`:

    ```env
    # Database (MongoDB)
    DATABASE_URL="mongodb+srv://..."

    # NextAuth.js
    AUTH_SECRET="your_generated_secret"

    # OAuth Providers (Optional - for GitHub/Google Login)
    GITHUB_CLIENT_ID=""
    GITHUB_CLIENT_SECRET=""
    GOOGLE_CLIENT_ID=""
    GOOGLE_CLIENT_SECRET=""

    # AI Service Configuration
    # URL for your local Ollama instance (default)
    OLLAMA_LOCAL_URL=http://localhost:11434
    
    # (Optional) URL for a cloud/remote Ollama instance
    OLLAMA_CLOUD_URL=https://your-cloud-instance.com
    ```

## Running the Application

1.  Start the development server:
    ```bash
    npm run dev
    ```

2.  Open [http://localhost:3000](http://localhost:3000) with your browser.

## Setting up Ollama Models

To use the AI features, you need at least one model installed in Ollama.

1.  Open your terminal.
2.  Pull a model (e.g., `codellama`, `tinyllama`, or `llama3`):
    ```bash
    ollama pull codellama:latest
    ```
3.  **Note**: If you have limited RAM (less than 8GB), try smaller models like `tinyllama` or `qwen:0.5b` to avoid memory errors.
