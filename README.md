# ☁️ Nimbus

> **Note**: This is a personal project created for learning and educational purposes.

**Nimbus** is a powerful, cloud-based Integrated Development Environment (IDE) and coding playground. Built with modern web technologies, it empowers developers to create, edit, and run code directly in the browser using WebContainer technology.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Next.js](https://img.shields.io/badge/Next.js-16.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)

## ✨ Key Features

-   **🚀 WebContainer Powered**: Run Node.js environments natively in the browser. No remote servers required for execution.
-   **💻 Full-Featured IDE**: robust code editing experience with [Monaco Editor](https://microsoft.github.io/monaco-editor/).
-   **🤖 AI Assistance**: Integrated AI chat to help debug, generate code, and answer questions.
-   **🔐 Secure & Flexible Auth**: Authentication via **NextAuth v5**, supporting secure user sessions and multiple providers.
-   **🎨 Modern & Accessible UI**: Beautifully designed with **Tailwind CSS**, **Radix UI**, and dark/light mode support.
-   **📂 Multi-Framework Templates**: Instantly start projects in React, Next.js, Vue, Angular, Express, and Hono.
-   **⚡ Real-time Previews**: Instantly see your changes with in-browser previews.

## 🛠️ Tech Stack

-   **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **Database**: [MongoDB](https://www.mongodb.com/) via [Prisma ORM](https://www.prisma.io/)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/) & [Radix UI](https://www.radix-ui.com/)
-   **State Management**: [Zustand](https://github.com/pmndrs/zustand)
-   **Editor**: [Monaco Editor](https://microsoft.github.io/monaco-editor/)
-   **Runtime**: [WebContainers](https://webcontainers.io/)
-   **Validation**: [Zod](https://zod.dev/) & [React Hook Form](https://react-hook-form.com/)

## 🚀 Getting Started

Follow these steps to run Nimbus locally.

### Prerequisites

-   **Node.js**: Version 18 or higher is required.
-   **MongoDB**: Ensure you have a MongoDB instance running (local or Atlas).

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/nimbus.git
    cd nimbus
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    # or
    yarn install
    # or
    pnpm install
    ```

### Environment Variables

Create a `.env` file in the root directory and add the following variables:

```env
# Database
DATABASE_URL="mongodb+srv://..."

# NextAuth
AUTH_SECRET="your_auth_secret"

# OAuth Providers (Add your specific providers here)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# AI Service (If applicable)
AI_API_KEY=""
```

### Run the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.


## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
