import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxy /api to the Flask server so the browser sees one origin (no CORS fuss).
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": "http://localhost:5000",
    },
  },
});
