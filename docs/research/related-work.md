# Related Work — Nimbus

> A survey of browser-based IDEs, cloud development environments, and AI-assisted development tools.

---

## 1. Browser-Based IDEs

### StackBlitz
StackBlitz [1] pioneered WebContainer-based browser IDEs, running Node.js entirely client-side via WebAssembly. It provides commercial-grade polish and framework support but lacks integrated AI assistance and is closed-source. Nimbus extends the WebContainer paradigm with multi-model AI integration and full open-source availability.

### CodeSandbox
CodeSandbox [2] transitioned from an in-browser bundler to Firecracker microVMs for server-side execution. While this enables broader language support, it reintroduces server dependency and network latency — the exact trade-offs Nimbus's client-side approach avoids.

### Replit
Replit [3] provides a multi-language cloud IDE with built-in AI (Ghostwriter). It supports 50+ languages through server containers. Nimbus differentiates through client-side execution and model-agnostic, privacy-preserving AI.

---

## 2. Cloud-Hosted IDEs

### GitHub Codespaces
Codespaces [4] runs full VS Code in cloud Docker containers on Azure. Cold starts take 30-60s and cost ~$0.18/hr. Nimbus targets the opposite model — instant, serverless, free.

### Gitpod
Gitpod [5] orchestrates cloud containers via Kubernetes with `.gitpod.yml` configuration. Its configuration-driven approach contrasts with Nimbus's zero-configuration client-side model.

### AWS Cloud9
Cloud9 [6] integrates with AWS services (Lambda, S3) through managed EC2 instances. It targets enterprise cloud-native workflows, a fundamentally different use case from Nimbus's lightweight prototyping focus.

---

## 3. WebAssembly Runtimes

### WebContainers (StackBlitz)
WebContainers [7] implement a POSIX-compatible OS layer in Wasm, enabling Node.js execution with `SharedArrayBuffer` for threading and Cross-Origin Isolation for security.

### Pyodide
Pyodide [8] compiles CPython to Wasm, enabling browser Python execution. A potential future extension for Nimbus's multi-language support.

### Wasmer / Wasmtime
Standalone WASI runtimes [9][10] demonstrating Wasm's portability beyond browsers, informing future multi-language WebContainer development.

---

## 4. AI-Assisted Development Tools

### GitHub Copilot
Copilot [11] uses OpenAI Codex for real-time code suggestions. Cloud-only, proprietary, with privacy concerns. Nimbus's local model support via Ollama provides an open, privacy-first alternative.

### Cursor
Cursor [12] is a VS Code fork with AI-first design (chat, multi-file context). Desktop-only and cloud-dependent. Nimbus applies similar principles in a browser-native, model-agnostic context.

### Cody (Sourcegraph)
Cody [13] provides AI assistance with repository-wide context. Multi-model but cloud-dependent. Nimbus uniquely supports fully local inference.

### Ollama
Ollama [14] provides local LLM inference on consumer hardware. Core dependency of Nimbus's AI pipeline, enabling the privacy advantage that differentiates it from commercial alternatives.

---

## 5. Comparative Summary

| System | Execution | AI | Local AI | Privacy | Open Source | Cost |
|---|---|---|---|---|---|---|
| **Nimbus** | Client (WASM) | ✅ Multi-model | ✅ Ollama | ✅ Code local | ✅ MIT | Free |
| StackBlitz | Client (WASM) | ❌ | ❌ | ✅ Code local | Partial | Freemium |
| CodeSandbox | Cloud (microVM) | ✅ Copilot | ❌ | ❌ Server | ❌ | Freemium |
| Codespaces | Cloud (VM) | ✅ Copilot | ❌ | ❌ Server | ❌ | $0.18/hr |
| Gitpod | Cloud (K8s) | ✅ Copilot | ❌ | ❌ Server | Partial | Freemium |
| Replit | Cloud | ✅ Built-in | ❌ | ❌ Server | ❌ | Freemium |
| Cursor | Desktop | ✅ Built-in | ❌ | Partial | ❌ | Sub |

> **Nimbus's unique position**: The only system combining client-side execution, local AI models, and full open-source availability.

---

## 6. Academic References

1. Haas, A., et al. "Bringing the Web up to Speed with WebAssembly." *PLDI 2017*.
2. Jangda, A., et al. "Not So Fast: Analyzing the Performance of WebAssembly vs. Native Code." *USENIX ATC 2019*.
3. Chen, M., et al. "Evaluating Large Language Models Trained on Code." *arXiv:2107.03374*, 2021.
4. Rozière, B., et al. "Code Llama: Open Foundation Models for Code." *arXiv:2308.12950*, 2023.
5. Vaithilingam, P., et al. "Expectation vs. Experience: Evaluating the Usability of Code Generation Tools." *CHI 2022*.
6. Shapiro, M., et al. "Conflict-free Replicated Data Types." *SSS 2011*.

---

## Product References

[1] StackBlitz — https://stackblitz.com/  
[2] CodeSandbox — https://codesandbox.io/  
[3] Replit — https://replit.com/  
[4] GitHub Codespaces — https://github.com/features/codespaces  
[5] Gitpod — https://www.gitpod.io/  
[6] AWS Cloud9 — https://aws.amazon.com/cloud9/  
[7] WebContainers API — https://webcontainers.io/  
[8] Pyodide — https://pyodide.org/  
[9] Wasmer — https://wasmer.io/  
[10] Wasmtime — https://wasmtime.dev/  
[11] GitHub Copilot — https://github.com/features/copilot  
[12] Cursor — https://cursor.sh/  
[13] Sourcegraph Cody — https://sourcegraph.com/cody  
[14] Ollama — https://ollama.com/
