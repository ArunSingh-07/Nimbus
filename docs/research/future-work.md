# Future Work — Nimbus

> Research directions and planned extensions for the Nimbus browser-native IDE.

---

## 1. Collaborative Real-Time Editing

**Priority**: High  
**Research Area**: Distributed Systems, CRDT Theory

### Objective
Enable multiple users to simultaneously edit the same project with real-time synchronization, cursor presence, and conflict resolution.

### Approach
- Implement **CRDTs (Conflict-free Replicated Data Types)** for operation-based text synchronization, avoiding the complexity of Operational Transformation.
- Use **WebSocket** connections for low-latency state propagation between collaborators.
- Integrate **cursor awareness** and **selection highlighting** in Monaco Editor via custom decorations.

### Research Questions
1. How do CRDTs perform under high-frequency edits in a browser-based editor with limited memory?
2. Can CRDT state be compacted efficiently within browser storage limits?
3. What is the perceived latency threshold for satisfactory collaborative editing in browser environments?

### References
- Shapiro, M., et al. "Conflict-free Replicated Data Types." *SSS 2011*.
- Kleppmann, M., et al. "Making CRDTs Byzantine Fault Tolerant." *PaPoC 2022*.

---

## 2. Language Server Protocol (LSP) Integration

**Priority**: High  
**Research Area**: Programming Language Tooling, IDE Architecture

### Objective
Provide advanced IDE features — go-to-definition, find references, rename refactoring, real-time diagnostics — by running LSP servers within the WebContainer.

### Approach
- Run language servers (TypeScript Server, ESLint, etc.) as processes within the WebContainer.
- Implement the LSP client protocol in the Monaco Editor integration layer.
- Use WebContainer's process IPC for communication between editor and language server.

### Research Questions
1. What is the performance overhead of running LSP servers within a WebAssembly sandbox compared to native execution?
2. Can memory-constrained browsers sustain concurrent language servers for multi-language projects?
3. How can LSP diagnostics be efficiently merged with AI-generated suggestions?

---

## 3. WebGPU-Accelerated Local Inference

**Priority**: Medium  
**Research Area**: Machine Learning Systems, WebGPU

### Objective
Run LLM inference entirely within the browser using WebGPU, eliminating the need for a local Ollama server while maintaining privacy.

### Approach
- Leverage WebGPU compute shaders for matrix operations required by transformer architectures.
- Use quantized models (4-bit GGUF) compiled for WebGPU execution via frameworks like [web-llm](https://github.com/mlc-ai/web-llm).
- Implement progressive loading with streaming inference for responsive code completion.

### Research Questions
1. What is the minimum model size that provides acceptable code completion quality when running via WebGPU?
2. How does WebGPU inference latency compare to local Ollama (CPU/GPU) inference for code-specialized models?
3. Can WebGPU inference and WebContainer execution coexist within browser memory limits?

---

## 4. Multi-Language Runtime Support

**Priority**: Medium  
**Research Area**: Programming Language Runtimes, WebAssembly

### Objective
Extend execution support beyond Node.js to Python, Rust, Go, and other languages by integrating additional WASM-compiled runtimes.

### Approach
- Integrate **Pyodide** for Python execution with scientific computing support.
- Explore **Rust via wasm-bindgen** for compiled-language support.
- Investigate **WASI-compatible** Go and C/C++ toolchains.
- Design a unified runtime manager that handles lifecycle across multiple language containers.

### Research Questions
1. Can multiple WASM runtimes (Node.js + Python + Rust) coexist in a single browser tab without memory exhaustion?
2. What inter-language communication patterns are feasible within the browser sandbox?
3. How can framework templates be generalized across language ecosystems?

---

## 5. Formal Security Analysis

**Priority**: Medium  
**Research Area**: Systems Security, Sandboxing

### Objective
Conduct rigorous security analysis of the WebContainer sandboxing model, identifying potential attack vectors and verifying isolation guarantees.

### Approach
- Analyze the WebContainer's use of `SharedArrayBuffer`, Cross-Origin Isolation, and browser sandbox policies.
- Investigate potential side-channel attacks (timing, memory access patterns) within the Wasm sandbox.
- Study malicious code containment — what happens when user-imported code attempts privileged operations.

### Research Questions
1. What are the concrete security boundaries enforced by browser Wasm sandboxes?
2. Can a malicious WebContainer process access resources outside its sandbox?
3. How does browser-level isolation (Site Isolation, COOP/COEP) interact with WebContainer security?

---

## 6. Intelligent Context-Aware AI

**Priority**: Low-Medium  
**Research Area**: AI-Assisted Software Engineering

### Objective
Enhance AI assistance with project-wide context awareness, enabling more accurate completions, refactoring suggestions, and bug detection.

### Approach
- Implement project-level indexing within the browser using lightweight AST parsing.
- Provide multi-file context to LLM inference requests via RAG (Retrieval-Augmented Generation).
- Explore fine-tuning open-source code models on framework-specific patterns.

### Research Questions
1. How much project context is needed for meaningful improvement in completion accuracy?
2. Can browser-side AST indexing remain performant for projects with 500+ files?
3. What is the optimal context window strategy for code completion vs. conversational debugging?

---

## 7. Offline-First Architecture

**Priority**: Low  
**Research Area**: Progressive Web Apps, Offline Computing

### Objective
Enable full offline functionality — code editing, execution, and AI assistance — without any network connectivity.

### Approach
- Implement Service Worker caching for all application assets and WASM binaries.
- Use IndexedDB for persistent project storage across sessions.
- Integrate WebGPU-based local inference (see Section 3) for offline AI features.

### Research Questions
1. Can the complete Nimbus application (including WebContainer WASM) be reliably served from Service Worker cache?
2. What synchronization strategy best handles offline-to-online transitions for project data?

---

## Summary of Research Directions

| Direction | Priority | Key Challenge | Estimated Complexity |
|---|---|---|---|
| Collaborative Editing (CRDTs) | High | Memory-efficient CRDTs in browser | High |
| LSP Integration | High | Wasm sandbox performance for language servers | Medium |
| WebGPU Inference | Medium | Model quality vs. browser resource limits | High |
| Multi-Language Runtimes | Medium | Multi-runtime memory coexistence | High |
| Formal Security Analysis | Medium | Browser sandbox boundary verification | Medium |
| Context-Aware AI | Low-Medium | Efficient browser-side project indexing | Medium |
| Offline-First Architecture | Low | Full asset caching + offline sync | Medium |
