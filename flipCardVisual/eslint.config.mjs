import typescriptEslint from "@typescript-eslint/eslint-plugin";
import powerbiVisualsConfigs from "eslint-plugin-powerbi-visuals";

export default [
    powerbiVisualsConfigs.configs.recommended,
    {
        ignores: ["node_modules/**", "dist/**", ".tmp/**", "coverage/**", "playwright-report/**", "test-results/**"],
    },
    {
        files: ["src/**/*.ts", "test/**/*.ts", "visual-tests/**/*.ts", "playwright.config.ts", "vite.config.mts"],
        plugins: {
            "@typescript-eslint": typescriptEslint,
        },
        rules: {
            "@typescript-eslint/no-explicit-any": "error",
            "no-constant-condition": "error",
            "no-debugger": "error",
        },
    },
    {
        files: ["visual-tests/**/*.ts", "playwright.config.ts", "vite.config.mts"],
        rules: { "powerbi-visuals/no-http-string": "off" },
    },
];
