import { defineConfig } from "vitest/config";

// Os testes de fronteira sobem o ESLint de verdade: lentos quando o turbo roda tudo em paralelo.
export default defineConfig({ test: { testTimeout: 30_000, hookTimeout: 30_000 } });
