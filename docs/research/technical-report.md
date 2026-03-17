# Nimbus: A Browser-Native Code Execution Environment with AI-Assisted Development

## Technical Report

**Author:** Arun Singh  
**Affiliation:** Bharati Vidyapeeth's College of Engineering, New Delhi  
**Date:** March 2026  
**Repository:** [github.com/ArunSingh-07/Nimbus](https://github.com/ArunSingh-07/Nimbus)

---

## Abstract

This report presents Nimbus, a browser-native integrated development environment (IDE) that enables full Node.js code execution within the browser through WebAssembly-based sandboxed containers, eliminating dependence on remote server infrastructure. The system integrates a hybrid AI assistance pipeline that routes inference requests between local and cloud-hosted large language models (LLMs) for real-time code completion and conversational debugging. We describe the system architecture, key design decisions, implementation challenges, and a comparative evaluation against existing browser-based and cloud-hosted development environments. Our findings demonstrate that client-side execution via WebContainers provides comparable developer experience to server-provisioned environments while offering significant advantages in latency, privacy, and operational cost.

---

## 1. Introduction

### 1.1 Background

The software development landscape has witnessed a fundamental shift toward browser-based tooling. Traditional development workflows require local environment setup — installing runtimes, package managers, and build tools — creating friction that disproportionately affects beginners, educators, and teams working across heterogeneous systems. Cloud-based IDEs emerged to address this by provisioning remote development environments, but they introduce their own challenges: network latency for every code execution, per-user infrastructure costs, and privacy concerns from transmitting source code to third-party servers.

### 1.2 Problem Statement

We identify four key limitations of the current cloud IDE paradigm:

1. **Server Dependency**: Every code execution requires network round-trips to provisioned virtual machines or containers, introducing latency and single points of failure.
2. **Scalability Costs**: Infrastructure costs scale linearly with concurrent users, making free-tier offerings unsustainable at scale.
3. **Privacy Concerns**: User source code must be transmitted to and stored on remote servers, raising data sovereignty and intellectual property concerns.
4. **Setup Friction**: Even cloud IDEs often require environment-specific configuration for AI assistance, with most tools locked to proprietary cloud APIs.

### 1.3 Contributions

Nimbus addresses these limitations through five key contributions:

1. A **zero-server execution architecture** using WebContainers for in-browser Node.js runtime, eliminating remote compute dependency.
2. A **resilient container lifecycle management** strategy using singleton patterns with debounced teardown.
3. A **hybrid AI inference pipeline** enabling privacy-first development with configurable local/cloud model routing.
4. A **recursive repository materialization** system for GitHub imports with WebContainer-compatible transformations.
5. A **multi-framework template system** for instant project bootstrapping across diverse JavaScript frameworks.

---

## 2. Background & Related Technologies

### 2.1 WebAssembly (Wasm)

WebAssembly is a binary instruction format designed as a portable compilation target for high-level languages. Originally intended for compute-intensive web applications, Wasm has evolved into a general-purpose sandboxed execution environment. The WebAssembly System Interface (WASI) extends Wasm with operating system-like capabilities — file system access, network I/O, and process management — enabling full runtime environments to execute within the browser sandbox.

### 2.2 WebContainers

WebContainers, developed by StackBlitz, represent a paradigm shift in browser-based code execution. Rather than emulating individual system calls, WebContainers implement a complete operating system layer in WebAssembly, capable of running Node.js and its ecosystem natively within the browser. Key characteristics include:

- **Full Node.js compatibility**: npm, yarn, and pnpm package managers function as expected.
- **Sandboxed file system**: An in-memory virtual file system with POSIX-like semantics.
- **Process spawning**: Ability to launch development servers, build tools, and test runners.
- **Cross-Origin Isolation**: Requires `SharedArrayBuffer` support via appropriate COOP/COEP headers.

### 2.3 Large Language Models for Code

The emergence of code-specialized LLMs — including Code Llama, StarCoder, and Gemini — has enabled AI-assisted development features such as code completion, generation, and debugging. Ollama provides a local inference server for running these models on consumer hardware, while cloud APIs offer higher-capacity alternatives. The challenge lies in integrating these capabilities seamlessly into the development workflow while preserving user privacy and model flexibility.

### 2.4 Monaco Editor

Monaco Editor, the core editing component of Visual Studio Code, provides a production-grade code editing experience including syntax highlighting, IntelliSense, code folding, minimap, and extensible language support. Its architecture supports custom decoration providers, enabling integration of AI-generated suggestions as inline ghost text.

---

## 3. System Design

### 3.1 High-Level Architecture

Nimbus follows a layered architecture with clear separation between the browser-side runtime layer, the React UI layer, and the Next.js API layer:

- **Browser Runtime Layer**: WebContainer instance, virtual file system, process management, development server.
- **UI Layer**: React components built with Next.js App Router, Monaco Editor integration, terminal emulation via xterm.js, resizable panel layout.
- **API Layer**: Next.js API routes handling authentication (NextAuth v5), AI request proxying, GitHub integration, and database operations (Prisma + MongoDB).
- **External Services**: Ollama (local/cloud), Google Generative AI, GitHub API, MongoDB Atlas.

### 3.2 WebContainer Lifecycle Management

A critical design challenge is managing the WebContainer singleton across React's component lifecycle, particularly under Strict Mode's double-mount behavior. Our solution employs:

1. **Global Singleton Promise**: A module-level `webcontainerInstancePromise` variable ensures only one boot operation occurs regardless of component remounts.
2. **Debounced Teardown**: On component unmount, teardown is scheduled with a 500ms delay. If the component remounts (as in Strict Mode), the pending teardown is cancelled, preserving the running instance.
3. **Error Recovery**: If boot fails, the promise is cleared, allowing subsequent mount attempts to retry.

```
Boot Flow:
Component Mount → Check Global Promise → [Null?] → Create Boot Promise → Await → Set Instance
                                        → [Exists?] → Await Existing → Set Instance

Unmount Flow:
Component Unmount → Schedule Teardown (500ms) → [Remount within 500ms?] → Cancel Teardown
                                                → [No Remount?] → Execute Teardown → Clear Promise
```

### 3.3 AI Inference Pipeline

The AI subsystem implements a proxy-router pattern:

1. **Model Discovery**: The `/api/models` endpoint aggregates available models from all configured Ollama instances, tagging each with its source (`local` or `cloud`).
2. **Request Routing**: Chat and code completion requests include the target model name and source. The API layer routes to the appropriate Ollama URL.
3. **Streaming Responses**: Chat responses are streamed from the inference server through the API layer to the client, maintaining low perceived latency.
4. **Code Completion Integration**: The `useAISuggestion` hook triggers completion requests on typing pauses, rendering suggestions as Monaco Editor ghost text decorations.

### 3.4 Data Model

The Prisma schema models the following entities:

- **User**: Authentication identity with role-based access (ADMIN, USER, PREMIUM_USER), editor preferences, and login history.
- **Playground**: A project container linked to a user, typed by template framework (REACT, NEXTJS, VUE, ANGULAR, EXPRESS, HONO, GITHUB).
- **TemplateFile**: JSON-serialized recursive file tree structure associated with a playground.
- **ChatMessage**: Conversation history between user and AI assistant.
- **LoginHistory**: Security audit trail capturing IP, user agent, browser, OS, device type, screen resolution, language, and timezone.

### 3.5 GitHub Repository Import

The import pipeline consists of three stages:

1. **URL Normalization**: Accepts various GitHub URL formats and converts to the API zipball endpoint.
2. **Fetch & Decompress**: Downloads the repository archive and decompresses using JSZip.
3. **Recursive Tree Construction**: Iterates through extracted file paths, strips the root wrapper directory, excludes lockfiles (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`) for WebContainer compatibility, and constructs the internal `TemplateFolder` JSON representation.

---

## 4. Implementation Details

### 4.1 Technology Choices

| Decision | Choice | Rationale |
|---|---|---|
| Meta-framework | Next.js 16 (App Router) | Server Actions, API Routes, React Server Components |
| State management | Zustand | Minimal boilerplate, supports `getState()` outside React |
| Database | MongoDB + Prisma | Flexible JSON storage for template file trees |
| Auth | NextAuth v5 | Built-in OAuth providers, session management |
| Styling | Tailwind CSS + Radix UI | Utility-first CSS with accessible primitives |
| Terminal | xterm.js | Industry-standard terminal emulation |

### 4.2 Key Implementation Challenges

**Challenge 1: React Strict Mode Compatibility**  
React 18+ Strict Mode unmounts and remounts components during development, causing double-boot of WebContainers (which only allows one instance per page). Solution: Global singleton with debounced teardown (Section 3.2).

**Challenge 2: File System Synchronization**  
Changes in Monaco Editor must synchronize to both the WebContainer's virtual file system (for execution) and the database (for persistence). Solution: Dual-write on save — `writeFileSync` to WebContainer, followed by `saveTemplateData` to MongoDB via Prisma.

**Challenge 3: Lockfile Exclusion**  
Importing GitHub repositories with existing lockfiles causes dependency resolution conflicts in the WebContainer, which may use different package manager versions. Solution: Explicit filtering during the JSZip extraction phase.

**Challenge 4: AI Suggestion Timing**  
Code completion must balance responsiveness with inference cost. Triggering on every keystroke creates excessive API load; triggering too infrequently feels unresponsive. Solution: Debounced trigger on typing pauses with cancellation of stale requests.

---

## 5. Evaluation

### 5.1 Functional Evaluation

| Feature | Status | Notes |
|---|---|---|
| React project execution | ✅ Functional | Full create-react-app support |
| Next.js project execution | ✅ Functional | App Router and Pages Router |
| Vue project execution | ✅ Functional | Vue 3 + Vite |
| Angular project execution | ✅ Functional | Angular CLI compatible |
| Express server execution | ✅ Functional | HTTP server in WebContainer |
| Hono server execution | ✅ Functional | Lightweight HTTP framework |
| GitHub repo import | ✅ Functional | Public + private (with OAuth) |
| AI chat | ✅ Functional | Streaming responses |
| AI code completion | ✅ Functional | Ghost text via Monaco decorations |
| Multi-model switching | ✅ Functional | Local and cloud Ollama instances |

### 5.2 Performance Characteristics

| Metric | Nimbus (WebContainer) | Traditional Cloud IDE |
|---|---|---|
| Cold boot time | ~3-5s (first load) | ~15-30s (container provisioning) |
| Warm boot time | ~1s (cached) | ~5-10s |
| File save latency | <50ms (local fs) | ~100-300ms (network + fs) |
| Preview refresh | <1s (local dev server) | ~1-2s (network relay) |
| Code completion | Model-dependent (0.5-3s) | Similar (API-bound) |

> **Note**: These are indicative measurements reflecting typical behavior. Formal benchmarking methodology is documented in [`evaluation.md`](evaluation.md).

### 5.3 Comparison with Existing Systems

| Feature | Nimbus | StackBlitz | CodeSandbox | GitHub Codespaces | Replit |
|---|---|---|---|---|---|
| Execution model | Client (WebContainer) | Client (WebContainer) | Cloud (microVM) | Cloud (VM) | Cloud (container) |
| Server required | No | No | Yes | Yes | Yes |
| Offline capable | Partial | Partial | No | No | No |
| AI code completion | Yes (multi-model) | No | Yes (Copilot) | Yes (Copilot) | Yes (built-in) |
| Local AI models | Yes (Ollama) | No | No | No | No |
| GitHub import | Yes | Yes | Yes | Yes | Yes |
| Multi-framework | 6+ templates | Yes | Yes | Any | Any |
| Open source | Yes (MIT) | Partially | No | No | No |
| Privacy | Code stays in browser | Code stays in browser | Server-side | Server-side | Server-side |

---

## 6. Limitations

1. **Browser Dependency**: Requires modern browsers with `SharedArrayBuffer` support (Chrome, Edge, Firefox). Safari support is limited.
2. **Node.js Only**: WebContainers currently support only Node.js runtimes. Python, Go, and other languages are not yet supported.
3. **Memory Constraints**: Browser memory limits cap project complexity. Large `node_modules` trees can cause out-of-memory errors.
4. **No Persistent Storage**: WebContainer file system is ephemeral; all persistence depends on database synchronization.
5. **AI Model Dependency**: Code completion quality depends entirely on the chosen model. Local models on consumer hardware may produce lower-quality suggestions.

---

## 7. Future Work

1. **Collaborative Editing**: Implement real-time multi-user editing using CRDTs (Conflict-free Replicated Data Types) with WebSocket synchronization.
2. **Language Server Protocol**: Integrate full LSP support within the WebContainer for advanced features like go-to-definition, refactoring, and diagnostics.
3. **WebGPU-Accelerated Inference**: Explore client-side LLM inference using WebGPU to eliminate network dependency for AI features.
4. **Multi-Language Runtimes**: Extend execution beyond Node.js by integrating additional WASM-compiled runtimes (Python via Pyodide, Rust via wasm-bindgen).
5. **Formal Security Analysis**: Conduct rigorous analysis of the WebContainer sandboxing boundary, particularly regarding cross-origin data access and side-channel attacks.

---

## 8. Conclusion

Nimbus demonstrates that modern browser technologies — specifically WebAssembly, WebContainers, and client-side LLM inference — enable feature-rich development environments that rival traditional server-provisioned IDEs. By eliminating remote compute dependency for code execution and providing flexible AI model routing, the system achieves a compelling balance between capability, privacy, and cost.

The architecture presented here is extensible to additional runtimes, collaborative features, and advanced AI capabilities, positioning browser-native development environments as a promising research direction in software engineering tooling.

---

## References

1. Haas, A., et al. "Bringing the Web up to Speed with WebAssembly." *PLDI 2017*.
2. StackBlitz. "WebContainers: Running Node.js Natively in the Browser." [webcontainers.io](https://webcontainers.io/), 2021.
3. Rozière, B., et al. "Code Llama: Open Foundation Models for Code." *arXiv:2308.12950*, 2023.
4. Microsoft. "Monaco Editor." [microsoft.github.io/monaco-editor](https://microsoft.github.io/monaco-editor/).
5. Shapiro, M., et al. "Conflict-free Replicated Data Types." *SSS 2011*.
6. Chen, M., et al. "Evaluating Large Language Models Trained on Code." *arXiv:2107.03374*, 2021.
7. Vercel. "Next.js." [nextjs.org](https://nextjs.org/).
8. Prisma. "Prisma ORM." [prisma.io](https://www.prisma.io/).
9. Ollama. "Run LLMs Locally." [ollama.com](https://ollama.com/).
10. W3C. "WebAssembly System Interface (WASI)." [wasi.dev](https://wasi.dev/).
