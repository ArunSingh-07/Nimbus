import type { Monaco } from "@monaco-editor/react";
import type { editor as MonacoEditor } from "monaco-editor";

export function registerPrettierOnSave(monaco: Monaco) {
  monaco.editor.addEditorAction({
    id: "format-on-save",
    label: "Prettier: Format on Save",
    keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
    run(editor: MonacoEditor.IStandaloneCodeEditor) {
      editor.getAction("editor.action.formatDocument")?.run();
    },
  });
}
