// vite.config.js (for Vercel)

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/", // You can change to "/" if needed
  build: {
    outDir: "dist",
  },
});
