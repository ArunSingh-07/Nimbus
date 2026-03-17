# System Design — Nimbus

> Detailed architecture documentation with diagrams illustrating component interactions, data flows, and system boundaries.

---

## 1. High-Level Architecture

```mermaid
graph TB
    subgraph Client["Browser (Client-Side)"]
        direction TB
        
        subgraph UILayer["UI Layer (React + Next.js App Router)"]
            Dashboard["Dashboard<br/>Project Management"]
            Playground["Playground Page<br/>IDE Interface"]
            AuthPages["Auth Pages<br/>Login / Register"]
        end
        
        subgraph EditorLayer["Editor Layer"]
            Monaco["Monaco Editor"]
            FileExplorer["File Explorer<br/>(Tree View)"]
            TabManager["Tab Manager<br/>(Open Files)"]
        end
        
        subgraph RuntimeLayer["Runtime Layer"]
            WC["WebContainer<br/>(WASM Sandbox)"]
            VFS["Virtual File System"]
            DevServer["Dev Server Process"]
            Terminal["Terminal (xterm.js)"]
        end
        
        subgraph AILayer["AI Client Layer"]
            AISuggestion["useAISuggestion Hook"]
            AIChatUI["AI Chat Sidebar"]
            ModelCtx["Model Context<br/>(Zustand)"]
        end
        
        Playground --> EditorLayer
        Playground --> RuntimeLayer
        Playground --> AILayer
        Monaco -->|"writeFile"| VFS
        VFS --> WC
        WC --> DevServer
        DevServer -->|"URL"| Preview["Live Preview (iframe)"]
        WC -->|"stdout"| Terminal
        AISuggestion -->|"Ghost Text"| Monaco
    end
    
    subgraph Server["Next.js API Layer (Server-Side)"]
        APIModels["/api/models"]
        APIChat["/api/chat"]
        APICompletion["/api/code-completion"]
        APIGitHub["/api/github/repos"]
        APITemplate["/api/template"]
        APIAuth["/api/auth"]
        APIUser["/api/user"]
        ServerActions["Server Actions<br/>(importGithubProject)"]
    end
    
    subgraph DataLayer["Data Layer"]
        Prisma["Prisma ORM"]
        MongoDB[(MongoDB Atlas)]
    end
    
    subgraph ExternalServices["External Services"]
        OllamaLocal["Ollama Local"]
        OllamaCloud["Ollama Cloud"]
        GeminiAPI["Google Generative AI"]
        GitHubAPI["GitHub API"]
        OAuthProviders["OAuth Providers<br/>(GitHub, Google)"]
    end
    
    AILayer -->|"fetch"| APIChat
    AILayer -->|"fetch"| APICompletion
    AILayer -->|"fetch"| APIModels
    Dashboard -->|"fetch"| APIGitHub
    Dashboard -->|"action"| ServerActions
    AuthPages --> APIAuth
    
    APIChat --> OllamaLocal
    APIChat --> OllamaCloud
    APIChat --> GeminiAPI
    APICompletion --> OllamaLocal
    APICompletion --> OllamaCloud
    APIModels --> OllamaLocal
    APIModels --> OllamaCloud
    APIGitHub --> GitHubAPI
    APIAuth --> OAuthProviders
    ServerActions --> GitHubAPI
    
    Server --> Prisma
    Prisma --> MongoDB
    
    style WC fill:#ff6b35,stroke:#333,color:#fff
    style VFS fill:#ff8c5a,stroke:#333,color:#fff
    style Monaco fill:#1e90ff,stroke:#333,color:#fff
    style MongoDB fill:#4db33d,stroke:#333,color:#fff
```

---

## 2. WebContainer Boot Sequence

```mermaid
sequenceDiagram
    participant Component as React Component
    participant Hook as useWebContainer Hook
    participant Global as Global Singleton
    participant WCAPI as WebContainer API
    participant VFS as Virtual File System
    
    Note over Component,VFS: Initial Mount
    Component->>Hook: Mount with templateData
    Hook->>Hook: Clear any pending teardown timer
    Hook->>Global: Check webcontainerInstancePromise
    
    alt Promise is null
        Hook->>WCAPI: WebContainer.boot()
        Global->>Global: Store boot promise
        WCAPI-->>Hook: WebContainer instance
    else Promise exists (remount)
        Global-->>Hook: Return existing promise
        Hook->>Hook: Await existing promise
    end
    
    Hook->>Component: setInstance(instance)
    Hook->>Component: setIsLoading(false)
    
    Note over Component,VFS: React Strict Mode Unmount
    Component->>Hook: Cleanup function called
    Hook->>Hook: Schedule teardown (500ms delay)
    
    Note over Component,VFS: React Strict Mode Remount
    Component->>Hook: Mount again
    Hook->>Hook: Cancel pending teardown ✓
    Hook->>Global: Await existing promise
    Global-->>Hook: Same instance (preserved)
    
    Note over Component,VFS: Actual Unmount (navigation away)
    Component->>Hook: Cleanup function called
    Hook->>Hook: Schedule teardown (500ms)
    Note over Hook: No remount within 500ms
    Hook->>WCAPI: instance.teardown()
    Hook->>Global: Clear promise to null
```

---

## 3. Code Execution Flow

```mermaid
sequenceDiagram
    participant User
    participant Editor as Monaco Editor
    participant Store as Zustand Store
    participant WC as WebContainer
    participant VFS as Virtual FS
    participant Server as Dev Server
    participant Preview as iframe Preview
    participant DB as MongoDB (via Prisma)
    
    Note over User,DB: File Editing & Execution
    
    User->>Editor: Type code changes
    Editor->>Store: updateFileContent(fileId, content)
    Store->>Store: Mark file as hasUnsavedChanges
    
    User->>Editor: Ctrl+S (Save)
    Editor->>Store: Get latest templateData
    
    par Sync to WebContainer
        Store->>WC: writeFileSync(path, content)
        WC->>VFS: fs.writeFile(path, content)
        VFS->>Server: Hot Module Reload triggered
        Server->>Preview: Updated content served
        Preview->>User: Live preview refreshed
    and Persist to Database
        Store->>DB: saveTemplateData(updatedTree)
        DB-->>Store: Confirmation
    end
    
    Store->>Store: Clear hasUnsavedChanges flag
    Store->>User: Toast: "Saved filename.ext"
```

---

## 4. AI Completion Pipeline

```mermaid
sequenceDiagram
    participant User
    participant Editor as Monaco Editor
    participant Hook as useAISuggestion
    participant API as /api/code-completion
    participant Router as AI Router
    participant Ollama as Ollama Instance
    
    User->>Editor: Typing pause detected
    Editor->>Hook: onTriggerSuggestion(type, editor, model)
    
    Hook->>Hook: Cancel any pending request
    Hook->>Hook: Build prompt from editor context
    
    Hook->>API: POST {prompt, model, source}
    API->>Router: Determine target URL from source
    
    alt source = "local"
        Router->>Ollama: Forward to localhost:11434
    else source = "cloud"
        Router->>Ollama: Forward to cloud URL
    end
    
    Ollama-->>API: Generated completion
    API-->>Hook: Response text
    
    Hook->>Editor: Render as ghost text decoration
    
    alt User presses Tab
        User->>Hook: acceptSuggestion()
        Hook->>Editor: Insert suggestion text
        Hook->>Hook: Clear decoration
    else User continues typing
        User->>Hook: rejectSuggestion()
        Hook->>Hook: Clear decoration
    end
```

---

## 5. GitHub Repository Import Flow

```mermaid
sequenceDiagram
    participant User
    participant Dialog as GithubImportDialog
    participant Action as Server Action
    participant Loader as github-loader.ts
    participant GitHub as GitHub API
    participant JSZip as JSZip Library
    participant DB as MongoDB (Prisma)
    
    User->>Dialog: Enter repo URL / Select from list
    Dialog->>Action: importGithubProject(url)
    
    Action->>Action: Authenticate user
    Action->>Action: Retrieve GitHub OAuth token (if available)
    
    Action->>Loader: downloadAndParseGithubRepo(url, token?)
    
    Loader->>Loader: Normalize URL → API zipball endpoint
    Loader->>GitHub: GET /repos/{owner}/{repo}/zipball
    GitHub-->>Loader: Binary ZIP archive
    
    Loader->>JSZip: Load ZIP buffer
    JSZip-->>Loader: Extracted file entries
    
    loop For each file entry
        Loader->>Loader: Strip root directory wrapper
        alt Is lockfile (package-lock.json, etc.)
            Loader->>Loader: Skip ✗
        else Is regular file
            Loader->>Loader: Add to TemplateFolder tree ✓
        end
    end
    
    Loader-->>Action: TemplateFolder JSON
    
    Action->>DB: Create Playground (template: GITHUB)
    Action->>DB: Create TemplateFile (content: JSON tree)
    Action->>Action: revalidatePath("/dashboard")
    
    Action-->>Dialog: Success
    Dialog->>User: Toast: "Project imported successfully"
```

---

## 6. Data Model (Entity Relationship)

```mermaid
erDiagram
    User ||--o{ Account : "has"
    User ||--o{ Playground : "owns"
    User ||--o{ StarMark : "stars"
    User ||--o{ ChatMessage : "sends"
    User ||--o{ LoginHistory : "has"
    Playground ||--o{ StarMark : "starred by"
    Playground ||--|| TemplateFile : "contains"
    
    User {
        string id PK
        string name
        string email UK
        string image
        UserRole role
        string editorTheme
        string editorFont
        boolean useColoredIcons
        datetime createdAt
        datetime updatedAt
    }
    
    Account {
        string id PK
        string userId FK
        string type
        string provider
        string providerAccountId
        string accessToken
        string refreshToken
    }
    
    Playground {
        string id PK
        string title
        string description
        Templates template
        string userId FK
        datetime createdAt
        datetime updatedAt
    }
    
    TemplateFile {
        string id PK
        json content
        string playgroundId FK_UK
        datetime createdAt
        datetime updatedAt
    }
    
    ChatMessage {
        string id PK
        string userId FK
        string role
        string content
        datetime createdAt
    }
    
    StarMark {
        string id PK
        string userId FK
        string playgroundId FK
        boolean isMarked
        datetime createdAt
    }
    
    LoginHistory {
        string id PK
        string userId FK
        string ipAddress
        string userAgent
        string browser
        string os
        string deviceType
        string screenResolution
        string language
        string timezone
        datetime createdAt
    }
```

---

## 7. Module Structure

```mermaid
graph LR
    subgraph modules["modules/"]
        ai-chat["ai-chat/<br/>├─ components/<br/>└─ hooks/"]
        auth["auth/<br/>(Auth utilities)"]
        code-exec["code-execution/<br/>(Execution logic)"]
        dashboard["dashboard/<br/>├─ actions/<br/>├─ components/<br/>└─ lib/"]
        home["home/<br/>(Landing page)"]
        playground["playground/<br/>├─ actions/<br/>├─ components/<br/>├─ hooks/<br/>└─ lib/"]
        test["test/<br/>(Test utilities)"]
        webcontainers["webcontainers/<br/>├─ components/<br/>└─ hooks/"]
    end
    
    subgraph app["app/ (Routes)"]
        appAuth["(auth)/ - Login/Register"]
        appRoot["(root)/ - Landing"]
        appDash["dashboard/ - Projects"]
        appPlay["playground/[id]/ - IDE"]
        appAPI["api/ - REST endpoints"]
    end
    
    subgraph lib["lib/ (Shared)"]
        db["db.ts - Prisma client"]
        ollama["ollama.ts - AI config"]
        template["template.ts - Templates"]
        utils["utils.ts - Utilities"]
        models["models.ts - Type defs"]
    end
    
    appPlay --> playground
    appPlay --> webcontainers
    appPlay --> ai-chat
    appDash --> dashboard
    appAuth --> auth
    
    playground --> lib
    dashboard --> lib
    webcontainers --> lib
    
    style modules fill:#1a1a2e,stroke:#16213e,color:#e0e0e0
    style app fill:#0f3460,stroke:#16213e,color:#e0e0e0
    style lib fill:#533483,stroke:#16213e,color:#e0e0e0
```

---

## 8. Deployment Architecture

```mermaid
graph TB
    subgraph Production["Production Deployment"]
        Vercel["Vercel<br/>(Next.js Hosting)"]
        
        subgraph ClientBrowser["User's Browser"]
            NextApp["Next.js App"]
            WC["WebContainer<br/>(WASM Runtime)"]
        end
    end
    
    subgraph Services["Backend Services"]
        MongoAtlas["MongoDB Atlas<br/>(Database)"]
        OllamaLocal["User's Local Ollama<br/>(localhost:11434)"]
        OllamaCloud["Cloud Ollama Instance<br/>(Optional)"]
    end
    
    subgraph AuthProviders["OAuth Providers"]
        GH["GitHub OAuth"]
        Google["Google OAuth"]
    end
    
    Vercel -->|"Serves"| NextApp
    NextApp -->|"API Calls"| Vercel
    Vercel -->|"Prisma"| MongoAtlas
    NextApp -->|"Direct (CORS)"| OllamaLocal
    Vercel -->|"Proxy"| OllamaCloud
    Vercel -->|"OAuth Flow"| AuthProviders
    
    style WC fill:#ff6b35,stroke:#333,color:#fff
    style Vercel fill:#000,stroke:#333,color:#fff
    style MongoAtlas fill:#4db33d,stroke:#333,color:#fff
```
