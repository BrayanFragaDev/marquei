import { defineConfig, devices } from "@playwright/test";

/**
 * URL base dos testes e2e. Nesta fase nao ha app; os testes reais das fases
 * seguintes apontam para os apps via BASE_URL.
 */
const baseURL = process.env["BASE_URL"] ?? "http://localhost:3000";
const emCI = process.env["CI"] !== undefined && process.env["CI"] !== "";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: emCI,
  // Teste instavel e bug (CLAUDE.md, secao 8): sem retry para esconder.
  retries: 0,
  reporter: emCI ? [["list"], ["html", { open: "never" }]] : "list",
  use: { baseURL, trace: "retain-on-failure" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});
