# Case Study: Implementing "Open GitHub Repository" Feature

This guide details the end-to-end implementation of the "Open GitHub Repository" feature in Nimbus. It is designed to help you explain the technical decisions, architecture, and code flow during an interview.

## 1. Requirement Analysis
**Goal:** Allow users to import any public GitHub repository or their own private repositories into the Nimbus IDE.
**Key Constraints:**
- Must handle both public URLs and authenticated user repositories.
- Must import the file structure correctly into the database (`Playground` and `TemplateFile` models).
- Must avoid importing lockfiles (`package-lock.json`, etc.) to ensure fresh dependencies in the WebContainer.

## 2. Database Schema Changes
**Concept:** We needed a way to distinguish GitHub-imported projects from standard templates (React, Next.js, etc.) to potentially handle them differently in the future (e.g., syncing back to GitHub).

**Action:** Updated `prisma/schema.prisma`.
- **Enum Change:** Added `GITHUB` to the `Templates` enum.
- **Why?** Leveraging the existing strict typing of the `template` field ensures type safety throughout the app.

```prisma
enum Templates {
  // ... existing templates
  GITHUB 
}
```

## 3. Backend Architecture

### A. Fetching User Repositories (API Route)
**Challenge:** We need to fetch the user's repositories from GitHub on the client side to populate the list.
**Solution:** A Next.js API Route (`/api/github/repos`).
- **Why not fetch directly from frontend?** We need the user's `access_token` stored in our database (via NextAuth). Exposing this token to the client is a security risk.
- **Flow:**
  1. `currentUser()` gets the authenticated session.
  2. `db.account.findFirst()` retrieves the GitHub provider's `access_token` for that user.
  3. Server-side `fetch` call to `https://api.github.com/user/repos` using the token.
  4. Returns a simplified JSON list to the frontend.

### B. Downloading & Parsing Repositories (Server Utility)
**Challenge:** GitHub provides repositories as Zip archives (Zipballs). We need to extract the text content and structure it into our recursive `TemplateFolder` format.
**Solution:** `modules/dashboard/lib/github-loader.ts`.
- **Tools:** `jszip` for handling binary zip data.
- **Logic:**
  1. **URL Normalization:** Converts varying inputs (e.g., `github.com/user/repo`) to the API zipball string (`api.github.com/repos/user/repo/zipball`).
  2. **Fetch & Unzip:** Downloads the binary buffer and loads it into JSZip.
  3. **Recursive Parsing:**
     - Iterates through file paths.
     - Ignores the root folder wrapper GitHub adds (e.g., `repo-main/`).
     - **Optimization:** Explicitly skips lockfiles (`package-lock.json`) to prevent version conflicts in the browser-based WebContainer.
     - Constructs a nested `TemplateFolder` object (Folders containing Items).

### C. Server Action for Import
**Challenge:** Connecting the UI to the database creation logic securely.
**Solution:** `importGithubProject` in `modules/dashboard/actions/index.ts`.
- **Role:** The "Controller" that orchestrates the flow.
- **Steps:**
  1. Authenticates user.
  2. Retrieves GitHub token (if available) to support Private Repos.
  3. Calls `downloadAndParseGithubRepo` to get the file tree.
  4. Creates `Playground` record with `template: "GITHUB"`.
  5. Creates `TemplateFile` record storing the JSON tree.
  6. `revalidatePath` to update the dashboard UI immediately.

## 4. Frontend Implementation

### A. The Dialog Component
**Component:** `GithubImportDialog`
- **UX Decision:** distinct tabs for "Public URL" vs "My Repositories".
- **My Repositories Tab:** Fetches from our new API route. Implements client-side search/filtering for snappy UI.
- **State Management:** Uses local state for the form inputs and selection.

### B. Integration
**Component:** `modules/dashboard/components/add-repo.tsx`
- **Refactor:** Converted from a simple Link to a Client Component handling the dialog state (`isOpen`).
- **Feedback Loop:** Uses `sonner` toasts ("Importing...", "Success") to give user feedback during the potentially long download/parse process.

## 5. Summary for Interviews
If asked "How did you build the GitHub Import feature?", you can summarize:

> "I implemented a full-stack flow starting with a schema update to support GitHub project types. On the backend, I built a secure API route to proxy user requests to GitHub using their stored OAuth tokens. I created a utility service using JSZip to download and normalize repository zipballs into our recursive JSON file structure, specifically filtering out lockfiles to ensure compatibility with our WebContainer environment. Finally, I tied it together with a Server Action and a responsive UI dialog handling both public URLs and private user repositories."
