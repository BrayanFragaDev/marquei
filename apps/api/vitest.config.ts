import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

// SWC emite a metadata de decorators que o Nest precisa para injecao de dependencia.
export default defineConfig({
  plugins: [swc.vite({ module: { type: "es6" } })],
  test: {
    // Pool do pg conecta sob demanda: o teste de saude nao toca no banco.
    env: {
      NODE_ENV: "test",
      DATABASE_URL: "postgres://postgres:postgres@localhost:5432/marquei",
      REDIS_URL: "redis://localhost:6379",
    },
    include: ["src/**/*.test.ts", "test/**/*.test.ts"],
    exclude: ["test/integracao/**", "node_modules/**"],
    passWithNoTests: true,
  },
});
