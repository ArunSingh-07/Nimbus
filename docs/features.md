# Features

## AI Chat

Located in the left sidebar, the AI Chat allows you to converse with LLMs about your code.

- **Enter to Send**: 
    - Type your message and press `Enter` to send. 
    - Use `Shift + Enter` to insert a new line without sending.
- **Code Highlighting**: Code blocks in responses are syntax-highlighted.
- **Context Aware**: The chat can be expanded to include code context (planned feature).

## Code Playground

The core of Nimbus is the Code Playground, where you can write and execute code.

- **File Explorer**: 
    - Create, rename, delete files and folders.
    - **Close All Files**: Quickly close all open tabs using the dropdown menu or the "Close All" button.
- **Editor**: 
    - Full-featured **Monaco Editor** with formatting and syntax highlighting.
    - **Save (Ctrl + S)**: Persist changes to your files and sync them with the WebContainer runtime.
    - **Save All**: Save all open files with unsaved changes at once.
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
