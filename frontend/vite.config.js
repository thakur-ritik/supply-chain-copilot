import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/supply-chain-copilot/",
  build: {
    outDir: "dist",
  },
});