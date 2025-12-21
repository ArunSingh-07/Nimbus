import type { Monaco } from "@monaco-editor/react";
import type { editor } from "monaco-editor";

import prettier from "prettier/standalone";
import parserBabel from "prettier/parser-babel";
import parserTypeScript from "prettier/parser-typescript";
import parserHtml from "prettier/parser-html";
import parserPostcss from "prettier/parser-postcss";

export function registerPrettier(monaco: Monaco) {
  monaco.languages.registerDocumentFormattingEditProvider(
    ["javascript", "typescript", "css", "html"],
    {
      provideDocumentFormattingEdits(model: editor.ITextModel) {
        const language = model.getLanguageId();

        const formatted = prettier.format(model.getValue(), {
          parser:
            language === "typescript"
              ? "typescript"
              : language === "javascript"
                ? "babel"
                : language === "css"
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
}
