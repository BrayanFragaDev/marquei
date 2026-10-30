import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./test/configuracao.tsx"],
    css: false,
    include: ["test/**/*.test.{ts,tsx}"],
  },
});
