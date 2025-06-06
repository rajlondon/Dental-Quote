import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// [https://vitejs.dev/config/](https://vitejs.dev/config/)
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Correctly map '@/ to ./client/src/ as defined in tsconfig.json
      "@": path.resolve(__dirname, "./client/src"),
      // Also add the @shared alias if you plan to use it in the client
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
});
