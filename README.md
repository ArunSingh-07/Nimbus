# ☁️ Nimbus

> **Note**: This is a personal project created for learning and educational purposes.

**Nimbus** is a powerful, cloud-based Integrated Development Environment (IDE) and coding playground. Built with modern web technologies, it empowers developers to create, edit, and run code directly in the browser using WebContainer technology.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## ✨ Key Features

- **🚀 WebContainer Powered**: Run Node.js environments natively in the browser. No remote servers required for execution.
- **💻 Full-Featured IDE**: robust code editing with [Monaco Editor](https://microsoft.github.io/monaco-editor/), supporting **Save**, **Close All**, and syntax highlighting.
- **🤖 AI Assistance**: Integrated AI chat to help debug, generate code, and answer questions. Supports **Enter to Send**.
- **🔐 Secure & Flexible Auth**: Authentication via **NextAuth v5**, supporting secure user sessions and multiple providers.
- **🎨 Modern & Accessible UI**: Beautifully designed with **Tailwind CSS**, **Radix UI**, and dark/light mode support.
- **📂 Multi-Framework Templates**: Instantly start projects in React, Next.js, Vue, Angular, Express, and Hono.
- **⚡ Real-time Previews**: Instantly see your changes with in-browser previews.

- **🚀 WebContainer Powered**: Run Node.js environments natively in the browser. No remote servers required for execution.
- **💻 Full-Featured IDE**: Robust code editing experience with [Monaco Editor](https://microsoft.github.io/monaco-editor/).
- **🤖 AI Assistance**:
  - **Chat**: Integrated AI chat to help debug and generate code.
  - **Code Completion**: Real-time inline code suggestions powered by Ollama.
  - **Multi-Model Support**: Switch seamlessly between Local and Cloud Ollama models.
- **🔐 Secure & Flexible Auth**: Authentication via **NextAuth v5**.
- **🎨 Modern UI**: Beautifully designed with **Tailwind CSS**, featuring consistent branding across dashboards and playgrounds, and intuitive navigation.
- **📂 Multi-Framework Templates**: Instantly start projects in React, Next.js, Vue, and more.

## 📚 Documentation

Detailed documentation is available in the [`docs/`](docs/) directory:

- [**Setup Guide**](docs/setup.md): Installation, prerequisites (Ollama), and configuration.
- [**Features Guide**](docs/features.md): How to use the Chat, Playground, and AI features.
- [**Troubleshooting**](docs/troubleshooting.md): Solutions for common errors (Connections, Memory).
- [**Architecture**](docs/architecture.md): Technical overview of the system.

## 🛠️ Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Prisma ORM](https://www.prisma.io/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- **Runtime**: [WebContainers](https://webcontainers.io/)

## 📚 Documentation

For detailed information, please check our documentation folder:

- [**Setup Guide**](docs/setup.md): Complete installation and environment configuration.
- [**Features**](docs/features.md): In-depth guide to all Nimbus features.
- [**Troubleshooting**](docs/troubleshooting.md): Solutions for common issues.
- [**Architecture**](docs/architecture.md): Overview of the technical design.

## 🚀 Getting Started

### Prerequisites

- **Node.js**: Version 18 or higher.
- **Ollama**: Required for AI features. [Download Ollama](https://ollama.com).

### Quick Start

1.  **Clone & Install**:

    ```bash
    git clone https://github.com/your-username/nimbus.git
    cd nimbus
    npm install
    ```

2.  **Configure Environment**:
    Create `.env.local` and add your database and Ollama URLs (see [Setup Guide](docs/setup.md) for details):

    ```env
    # AI Service
    OLLAMA_LOCAL_URL=http://localhost:11434
    ```

3.  **Run**:

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) to see the app.
