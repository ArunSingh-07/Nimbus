# Evaluation — Nimbus

> Benchmarking methodology, performance analysis, and comparative evaluation of Nimbus against existing development environments.

---

## 1. Evaluation Objectives

This evaluation aims to characterize Nimbus along the following dimensions:

1. **Boot Performance**: Time from page load to code-ready state.
2. **Runtime Efficiency**: Memory footprint and CPU utilization during development workflows.
3. **Framework Compatibility**: Breadth of supported project types and their functional correctness.
4. **AI Integration Effectiveness**: Code completion latency and usability.
5. **Feature Comparison**: Qualitative and quantitative comparison with existing systems.

---

## 2. Methodology

### 2.1 Environment

| Parameter | Value |
|---|---|
| Browser | Google Chrome 124 (64-bit) |
| OS | Windows 11 |
| CPU | AMD Ryzen 5 / Intel Core i5 (comparable) |
| RAM | 16 GB |
| Network | 50 Mbps broadband (for cloud comparisons) |
| Ollama Model | `codellama:7b` (local), `llama3:8b` (cloud) |

### 2.2 Measurement Approach

- **Boot Time**: Measured from `navigation start` to `WebContainer instance ready` using `Performance.now()` timestamps.
- **Memory**: Captured via Chrome DevTools Performance Monitor (JS Heap Size).
- **AI Latency**: Measured from request dispatch to first response token arrival.
- **Framework Tests**: Each supported framework template is booted, a file is modified, and the preview is verified for correctness.

---

## 3. Boot Performance

### 3.1 WebContainer Boot Time

| Scenario | Mean Time | Notes |
|---|---|---|
| Cold boot (first visit) | ~4.2s | Includes WASM download and compilation |
| Warm boot (cached WASM) | ~1.1s | Service Worker / browser cache hit |
| Hot reload (Strict Mode remount) | ~50ms | Singleton preservation, no re-boot |

### 3.2 Comparison: Boot Time vs. Cloud IDEs

| Platform | Cold Start | Warm Start | Architecture |
|---|---|---|---|
| **Nimbus** | ~4.2s | ~1.1s | Client-side WebContainer |
| **StackBlitz** | ~3-5s | ~1-2s | Client-side WebContainer |
| **CodeSandbox** | ~8-15s | ~3-5s | Cloud microVM |
| **GitHub Codespaces** | ~30-60s | ~10-15s | Cloud VM (Docker) |
| **Gitpod** | ~20-40s | ~8-12s | Cloud container |
| **Replit** | ~5-10s | ~3-5s | Cloud container |

> **Key Insight**: Client-side execution (Nimbus, StackBlitz) achieves 3-10× faster boot times than server-provisioned environments, particularly for warm starts.

---

## 4. Memory Footprint

### 4.1 Heap Usage by Scenario

| Scenario | JS Heap Size | Total Tab Memory |
|---|---|---|
| Dashboard (no WebContainer) | ~25 MB | ~80 MB |
| Playground idle (container booted) | ~85 MB | ~180 MB |
| React project running (dev server) | ~120 MB | ~250 MB |
| Next.js project running | ~150 MB | ~320 MB |
| With AI chat active | +~15 MB | +~20 MB |

### 4.2 Memory Growth Over Time

During a 30-minute active development session (frequent edits, saves, and preview refreshes):

| Time | Heap Size | Notes |
|---|---|---|
| 0 min | ~120 MB | Initial state |
| 10 min | ~135 MB | Moderate growth from editor buffers |
| 20 min | ~140 MB | Stabilizing — GC effective |
| 30 min | ~145 MB | Minor leak from terminal output accumulation |

> **Observation**: Memory usage remains stable with no significant leaks. The primary growth vector is terminal output history, which is bounded by xterm.js buffer limits.

---

## 5. Framework Compatibility Matrix

| Framework | Template | Boot | Build | Preview | Hot Reload | Notes |
|---|---|---|---|---|---|---|
| React (CRA) | ✅ | ✅ | ✅ | ✅ | ✅ | Full compatibility |
| Next.js | ✅ | ✅ | ✅ | ✅ | ✅ | App Router supported |
| Vue 3 (Vite) | ✅ | ✅ | ✅ | ✅ | ✅ | SFC compilation works |
| Angular | ✅ | ✅ | ✅ | ✅ | ✅ | CLI commands functional |
| Express.js | ✅ | ✅ | N/A | ✅ | ✅ | HTTP server accessible via preview |
| Hono | ✅ | ✅ | N/A | ✅ | ✅ | Lightweight HTTP framework |
| GitHub Import | ✅ | ✅ | ⚠️ | ✅ | ✅ | Depends on project complexity |

> **⚠️ GitHub Import caveat**: Very large repositories (>1000 files) may experience slow initial mount due to recursive file tree construction.

---

## 6. AI Code Completion

### 6.1 Latency by Model

| Model | Source | Avg. Latency | Quality (Subjective) |
|---|---|---|---|
| `codellama:7b` | Local | ~1.2s | Good — context-aware completions |
| `tinyllama:1.1b` | Local | ~0.5s | Fair — shorter, less contextual |
| `qwen:0.5b` | Local | ~0.3s | Fair — fast but limited context |
| `llama3:8b` | Cloud | ~0.8s | Good — balanced speed/quality |
| `codellama:13b` | Cloud | ~1.5s | Very Good — best completions |
| Google Gemini | Cloud | ~0.7s | Very Good — strong contextual understanding |

### 6.2 Completion Accuracy

Informal testing across common coding tasks (function completion, error handling, boilerplate generation):

| Task Type | Success Rate (Acceptable Completion) |
|---|---|
| Function body completion | ~75% |
| Import statement completion | ~85% |
| Error handling patterns | ~70% |
| CSS property completion | ~60% |
| Complex algorithm completion | ~40% |

> **Note**: These are informal observations, not rigorous benchmarks. Actual accuracy varies significantly with prompt quality, model size, and context window.

---

## 7. Comparative Feature Matrix

### 7.1 Core Features

| Feature | Nimbus | StackBlitz | CodeSandbox | Codespaces | Replit |
|---|---|---|---|---|---|
| In-browser execution | ✅ | ✅ | ❌ | ❌ | ❌ |
| No server required | ✅ | ✅ | ❌ | ❌ | ❌ |
| File explorer | ✅ | ✅ | ✅ | ✅ | ✅ |
| Terminal | ✅ | ✅ | ✅ | ✅ | ✅ |
| Live preview | ✅ | ✅ | ✅ | ✅ | ✅ |
| GitHub import | ✅ | ✅ | ✅ | ✅ | ✅ |
| Multi-framework | ✅ | ✅ | ✅ | ✅ | ✅ |
| Dark/Light theme | ✅ | ✅ | ✅ | ✅ | ✅ |
| Editor settings | ✅ | ✅ | ✅ | ✅ | ✅ |
| Star/bookmark projects | ✅ | ❌ | ✅ | ❌ | ✅ |

### 7.2 AI Features

| Feature | Nimbus | StackBlitz | CodeSandbox | Codespaces | Replit |
|---|---|---|---|---|---|
| AI chat | ✅ | ❌ | ✅ | ✅ (Copilot Chat) | ✅ |
| Code completion | ✅ | ❌ | ✅ (Copilot) | ✅ (Copilot) | ✅ |
| Local model support | ✅ | ❌ | ❌ | ❌ | ❌ |
| Multi-model selection | ✅ | ❌ | ❌ | ❌ | ❌ |
| Model source routing | ✅ | ❌ | ❌ | ❌ | ❌ |
| Privacy-first AI | ✅ | N/A | ❌ | ❌ | ❌ |

### 7.3 Architecture & Cost

| Aspect | Nimbus | StackBlitz | CodeSandbox | Codespaces | Replit |
|---|---|---|---|---|---|
| Open source | ✅ (MIT) | Partial | ❌ | ❌ | ❌ |
| Self-hostable | ✅ | ❌ | ❌ | ❌ | ❌ |
| Per-user server cost | $0 | $0 | ~$0.05/hr | ~$0.18/hr | ~$0.01/hr |
| Offline capable | Partial | Partial | ❌ | ❌ | ❌ |
| Multi-language | Node.js only | Node.js | Any | Any | Any |

---

## 8. Key Findings

1. **Client-side execution is competitive**: Boot times are 3-10× faster than server-provisioned environments for typical web development workflows.

2. **Memory is the primary constraint**: Browser-based execution is limited by tab memory allocation (~2-4 GB depending on browser/OS), which restricts maximum project complexity.

3. **AI model flexibility is a differentiator**: The ability to use local models via Ollama provides a unique privacy advantage not available in any commercial competitor.

4. **Framework support is robust**: All 6 supported frameworks boot successfully, build correctly, and provide live preview with hot module reload.

5. **The Node.js-only limitation is significant**: Lack of Python, Java, and other runtime support limits applicability to web development use cases.

---

## 9. Threats to Validity

- **Hardware Variability**: Boot times and memory usage vary significantly across hardware configurations. Results are indicative, not universal.
- **Model Quality**: AI completion quality depends on model choice and hardware. Local inference on consumer GPUs may not match cloud API quality.
- **Competitive Landscape**: Feature availability in competing products changes frequently. Comparisons reflect the state as of March 2026.
- **Subjective Metrics**: Code completion "quality" and "success rate" are informally assessed and may not generalize.
