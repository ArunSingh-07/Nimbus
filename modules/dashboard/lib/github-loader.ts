
import JSZip from "jszip";
import path from "path";
import { TemplateFile, TemplateFolder, TemplateItem } from "@/modules/playground/lib/path-to-json";

export async function downloadAndParseGithubRepo(
  url: string,
  token?: string | null
): Promise<TemplateFolder> {
  const zipUrl = getZipUrl(url);
  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(zipUrl, { headers });

  if (!response.ok) {
    throw new Error(`Failed to download repo: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);

  // GitHub zipballs have a root folder (e.g. "repo-name-sha/..."). 
  // We want to skip this root folder and treat its children as root.
  const rootFolder: TemplateFolder = {
    folderName: "Root",
    items: [],
  };

  const files = Object.keys(zip.files);
  // Find the root folder prefix
  const rootPrefix = files[0].split("/")[0] + "/";

  for (const relativePath of files) {
    if (zip.files[relativePath].dir) continue;
    
    // Remove root prefix
    if (!relativePath.startsWith(rootPrefix)) continue;
    const cleanPath = relativePath.substring(rootPrefix.length);
    
    // Skip if empty path (should happen if it was just the root dir)
    if (!cleanPath) continue;

    // Skip lockfiles to ensure fresh install in WebContainer
    if (cleanPath === 'package-lock.json' || cleanPath === 'yarn.lock' || cleanPath === 'pnpm-lock.yaml') continue;

    const content = await zip.files[relativePath].async("string");
    
    addFileToFolder(rootFolder, cleanPath, content);
  }

  return rootFolder;
}

function getZipUrl(url: string): string {
  // Handle various formats:
  // https://github.com/user/repo
  // https://github.com/user/repo.git
  // user/repo
  
  let cleanUrl = url.trim();
  if (cleanUrl.endsWith(".git")) {
    cleanUrl = cleanUrl.slice(0, -4);
  }
  
  if (!cleanUrl.startsWith("http")) {
      // assume user/repo format if not http
      if (cleanUrl.split("/").length === 2) {
          cleanUrl = `https://github.com/${cleanUrl}`;
      }
  }

  // Convert to zipball url
  // https://github.com/user/repo -> https://api.github.com/repos/user/repo/zipball
  // But wait, the public zipball url is often https://github.com/user/repo/archive/refs/heads/main.zip
  // Using API is safer including private repos.
  
  const match = cleanUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
  if (!match) {
    throw new Error("Invalid GitHub URL");
  }
  
  const [, owner, repo] = match;
  return `https://api.github.com/repos/${owner}/${repo}/zipball`;
}

function addFileToFolder(root: TemplateFolder, filePath: string, content: string) {
  const parts = filePath.split("/");
  const fileName = parts.pop()!;
  
  let currentFolder = root;
  
  // Navigate/Create folders
  for (const folderName of parts) {
    let existingFolder = currentFolder.items.find(
      (item): item is TemplateFolder => "folderName" in item && item.folderName === folderName
    );
    
    if (!existingFolder) {
      existingFolder = {
        folderName,
        items: []
      };
      currentFolder.items.push(existingFolder);
    }
    currentFolder = existingFolder;
  }
  
  // Add file
  const parsedPath = path.parse(fileName);
  const fileExtension = parsedPath.ext.replace(/^\./, "");
  const filename = parsedPath.name; // This mimics path.parse behavior where name is without ext
  // Special case: files starting with dot e.g. .gitignore -> name=".gitignore", ext="" in some logical mapping, 
  // but path.parse(".gitignore") -> name=".gitignore", ext=""
  // path.parse("foo.js") -> name="foo", ext=".js"
  
  // However, `path-to-json.ts` logic was:
  // filename: parsedPath.name,
  // fileExtension: parsedPath.ext.replace(/^\./, "")
  
  // So for .env: name=".env", ext="" -> filename=".env", fileExtension=""
  
  currentFolder.items.push({
    filename,
    fileExtension,
    content
  });
}
