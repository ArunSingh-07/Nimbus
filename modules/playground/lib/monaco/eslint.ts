import type { Monaco } from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";

import prettier from "prettier/standalone";
import parserBabel from "prettier/parser-babel";
import parserTypeScript from "prettier/parser-typescript";
import parserHtml from "prettier/parser-html";
import parserPostcss from "prettier/parser-postcss";
import { Linter } from "eslint";

/* ------------------------------------------------------------------ */
/* Language Detection */
/* ------------------------------------------------------------------ */

export const getEditorLanguage = (fileExtension: string): string => {
  const extension = fileExtension.toLowerCase();
  const languageMap: Record<string, string> = {
    js: "javascript",
    jsx: "javascript",
    ts: "typescript",
    tsx: "typescript",
    mjs: "javascript",
    cjs: "javascript",

    json: "json",
    html: "html",
    htm: "html",
    css: "css",
    scss: "scss",
    sass: "scss",
    less: "less",

    md: "markdown",
    markdown: "markdown",
    xml: "xml",
    yaml: "yaml",
    yml: "yaml",

    py: "python",
    java: "java",
    c: "c",
    cpp: "cpp",
    cs: "csharp",
    php: "php",
    rb: "ruby",
    go: "go",
    rs: "rust",
    sh: "shell",
    bash: "shell",
    sql: "sql",

    toml: "ini",
    ini: "ini",
    conf: "ini",
    dockerfile: "dockerfile",
  };

  return languageMap[extension] || "plaintext";
};

/* ------------------------------------------------------------------ */
/* Monaco Configuration */
/* ------------------------------------------------------------------ */

let initialized = false;
const eslintLinter = new Linter();

export const configureMonaco = (monaco: Monaco) => {
  if (initialized) return;
  initialized = true;

  /* ---------------- One Dark Pro Theme ---------------- */

  monaco.editor.defineTheme("one-dark-pro", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "5C6370", fontStyle: "italic" },
      { token: "keyword", foreground: "C678DD" },
      { token: "string", foreground: "98C379" },
      { token: "number", foreground: "D19A66" },
      { token: "entity.name.function", foreground: "61AFEF" },
      { token: "variable", foreground: "E06C75" },
      { token: "entity.name.type", foreground: "E5C07B" },
      { token: "punctuation", foreground: "ABB2BF" },
    ],
    colors: {
      "editor.background": "#0B0F14",
      "editor.foreground": "#ABB2BF",
      "editor.lineHighlightBackground": "#2C313A",
      "editor.selectionBackground": "#3E4451",
      "editorCursor.foreground": "#528BFF",
      "editorLineNumber.foreground": "#495162",
      "editorLineNumber.activeForeground": "#ABB2BF",
    },
  });

  monaco.editor.setTheme("one-dark-pro");

  /* ---------------- TypeScript / JavaScript ---------------- */

  monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false,
  });

  monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowJs: true,
    noEmit: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
  });

  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.Latest,
    allowJs: true,
    noEmit: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
  });

  /* ---------------- Prettier Formatter ---------------- */

  monaco.languages.registerDocumentFormattingEditProvider(
    ["javascript", "typescript", "css", "html"],
    {
      provideDocumentFormattingEdits(model: MonacoEditor.ITextModel) {
        const lang = model.getLanguageId();

        const formatted = prettier.format(model.getValue(), {
          parser:
            lang === "typescript"
              ? "typescript"
              : lang === "javascript"
                ? "babel"
                : lang === "css"
                  ? "css"
                  : "html",
          plugins: [parserBabel, parserTypeScript, parserHtml, parserPostcss],
          semi: true,
          singleQuote: true,
          printWidth: 100,
        });

        return [
          {
            range: model.getFullModelRange(),
            text: formatted,
          },
        ];
      },
    }
  );

  /* ---------------- Prettier on Save ---------------- */

  monaco.editor.addEditorAction({
    id: "format-on-save",
    label: "Prettier: Format on Save",
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
    run(editor: MonacoEditor.IStandaloneCodeEditor) {
      editor.getAction("editor.action.formatDocument")?.run();
    },
  });

  /* ---------------- ESLint Diagnostics ---------------- */

  const validateWithESLint = (model: MonacoEditor.ITextModel) => {
    if (!["javascript", "typescript"].includes(model.getLanguageId())) return;

    const messages = eslintLinter.verify(model.getValue(), {
      env: { browser: true, es2021: true },
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
      rules: {
        semi: ["error", "always"],
        quotes: ["error", "single"],
        "no-unused-vars": "warn",
      },
    });

    monaco.editor.setModelMarkers(
      model,
      "eslint",
      messages.map((m) => ({
        startLineNumber: m.line,
        startColumn: m.column,
        endLineNumber: m.endLine || m.line,
        endColumn: m.endColumn || m.column + 1,
        message: m.message,
        severity:
          m.severity === 2
            ? monaco.MarkerSeverity.Error
            : monaco.MarkerSeverity.Warning,
      }))
    );
  };

  monaco.editor.onDidCreateModel((model: MonacoEditor.ITextModel) => {
    validateWithESLint(model);
    model.onDidChangeContent(() => validateWithESLint(model));
  });
};

/* ------------------------------------------------------------------ */
/* Editor Options */
/* ------------------------------------------------------------------ */

export const defaultEditorOptions = {
  fontSize: 14,
  fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, Menlo, monospace",
  fontLigatures: true,

  minimap: { enabled: true },
  automaticLayout: true,

  wordWrap: "on",
  wordBasedSuggestions: "currentDocument",

  formatOnPaste: true,
  formatOnType: false,

  cursorBlinking: "smooth",
  cursorSmoothCaretAnimation: "on",
  cursorStyle: "line",

  matchBrackets: "always",

  "semanticHighlighting.enabled": true,
};
