# Features

## AI Chat

Located in the left sidebar, the AI Chat allows you to converse with LLMs about your code.

- **Enter to Send**: Type your message and press `Enter` to send. Use `Shift + Enter` for a new line.
- **Code Highlighting**: Code blocks in responses are syntax-highlighted.
- **Context Aware**: The chat can be expanded to include code context (planned feature).

## Code Playground

The core of Nimbus is the Code Playground, where you can write and execute code.

- **File Explorer**: Create, rename, and delete files and folders.
- **Editor**: A full-featured Monaco editor with syntax highlighting.
- **AI Code Completion**:
    - As you type, the AI suggests code completions.
    - Suggestions appear as "ghost text".
    - Press `Tab` to accept a suggestion.
    - If a suggestion is unavailable (e.g., due to model errors), a comment line will appear explaining why.

## Multi-Model Support

Nimbus supports connecting to multiple Ollama instances and selecting specific models.

- **Model Selection**:
    - Use the dropdown in the **Chat Sidebar** or the **Playground Header** to select your preferred model.
    - Selection is synchronized: changing it in one place updates the other.
- **Local & Cloud**:
    - Models from your local Ollama (`localhost:11434`) are labeled as `(local)`.
    - Models from your cloud instance (configured via `OLLAMA_CLOUD_URL`) are labeled as `(cloud)`.
