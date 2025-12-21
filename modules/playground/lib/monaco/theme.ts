import type { Monaco } from "@monaco-editor/react";

let defined = false;

export function defineOneDarkPro(monaco: Monaco) {
  if (defined) return;
  defined = true;

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
}
