import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

// SWC emite a metadata de decorators que o Nest precisa para injecao de dependencia.
export default defineConfig({
  plugins: [swc.vite({ module: { type: "es6" } })],
  test: {
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
    exclude: ["test/integracao/**", "node_modules/**"],
    passWithNoTests: true,
  },
});
