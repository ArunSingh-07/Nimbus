# Features

## AI Chat

Located in the left sidebar, the AI Chat allows you to converse with LLMs about your code.

- **Enter to Send**:
  - Type your message and press `Enter` to send.
  - Use `Shift + Enter` to insert a new line without sending.
- **Code Highlighting**: Code blocks in responses are syntax-highlighted.
- **Context Aware**: The chat can be expanded to include code context (planned feature).

### AI Controls

Located in the playground header, the **AI Button** (Bot icon) manages AI features:

- **Status Indicator**:
  - 🟢 **Green Pulse**: AI features are Active.
  - 🔴 **Red Pulse**: AI features are Inactive.
- **Dropdown Menu**:
  - **Enable/Disable AI**: Toggle all AI assistance features.
  - **Open Chat**: Opens the AI Chat Sidebar interaction panel.

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

## Dashboard & Navigation

- **Unified Branding**: Consistent visual identity across the Dashboard and Playground sidebars.
- **Project Management**:
  - **Open in New Tab**: All project links now open in a new tab for better multitasking.
  - **Settings Dropdown**: Access **Settings** and **Log out** directly from the sidebar footer.
- **Documentation**: Easy access to project documentation via the "Docs" link (redirects to GitHub).

## Privacy & Security

Nimbus respects your privacy and ensures your data is secure.

- **Login History**:
  - For security auditing, Nimbus tracks login history including IP address, device type, browser, and OS.
  - You can view your recent login activity in the dashboard settings (planned feature).
- **Data Collections**:
  - We collect minimal data necessary for the functionality of the service.
  - No code or personal data is shared with third parties without your explicit consent (e.g., when using cloud AI models).
