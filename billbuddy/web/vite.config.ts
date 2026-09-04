import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Dev-only proxy: the built app is served by the BillBuddy server itself
// (same origin, no proxy needed), but `vite dev` runs on its own port, so
// forward /api calls to the local server during development.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
      },
    },
  },
});
