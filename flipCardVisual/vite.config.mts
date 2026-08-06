import { defineConfig } from "vite";

export default defineConfig({
    clearScreen: false,
    root: "visual-tests",
    server: { host: "127.0.0.1", port: 4173, strictPort: true },
});
