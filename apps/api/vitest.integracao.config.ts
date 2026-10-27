import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

// Integracao roda contra PostgreSQL real (nunca mockado), um arquivo por vez.
export default defineConfig({
  plugins: [swc.vite({ module: { type: "es6" } })],
  test: {
    include: ["test/integracao/**/*.test.ts"],
    fileParallelism: false,
    testTimeout: 20_000,
    hookTimeout: 20_000,
  },
});
