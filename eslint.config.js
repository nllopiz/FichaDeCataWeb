import js from "@eslint/js";
import globals from "globals";

export default [
  { ignores: ["node_modules/**", "test-results/**", "playwright-report/**"] },
  js.configs.recommended,
  {
    files: ["js/**/*.js"],
    languageOptions: {
      sourceType: "module",
      globals: { ...globals.browser },
    },
  },
  {
    files: ["tests/**/*.js"],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
  {
    // Los specs de Playwright corren en Node, pero sus callbacks (addInitScript,
    // evaluate) se ejecutan en el navegador: ambos conjuntos de globals.
    files: ["e2e/**/*.js"],
    languageOptions: {
      globals: { ...globals.node, ...globals.browser },
    },
  },
  {
    files: ["scripts/**/*.mjs", "*.config.js", "eslint.config.js"],
    languageOptions: {
      globals: { ...globals.node },
    },
  },
];
