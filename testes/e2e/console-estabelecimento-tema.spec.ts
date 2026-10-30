import { expect, test } from "@playwright/test";

/**
 * Fluxo critico do console do estabelecimento: login -> editar cor -> salvar rascunho -> publicar.
 *
 * Pre-requisitos (BASE_URL aponta para o console, ex.: http://localhost:3001):
 *   pnpm mock:api                                   # API simulada, porta 4010
 *   pnpm --filter @marquei/console-estabelecimento build && pnpm --filter @marquei/console-estabelecimento start
 *   BASE_URL=http://localhost:3001 pnpm --filter @marquei/testes test:e2e console-estabelecimento-tema
 * Credenciais: dados publicos do mock (`packages/api-client/mock/dados.ts`), sobrescreviveis por env.
 * CHROMIUM_PATH (opcional) usa um Chromium ja instalado quando o do Playwright nao esta disponivel.
 */
const ESTABELECIMENTO = process.env["E2E_ESTABELECIMENTO"] ?? "barbearia-do-ze";
const EMAIL = process.env["E2E_EMAIL"] ?? "dono@barbearia-do-ze.exemplo.test";
const SENHA = process.env["E2E_SENHA"] ?? "senha-mock-123";
const COR_ESCURA = "#0b5d34";
// Apoio claro: com texto escuro passa em WCAG AA, o que libera o botao Publicar.
const COR_DE_APOIO_CLARA = "#f1d4d1";
const caminhoDoChromium = process.env["CHROMIUM_PATH"];

test.use(caminhoDoChromium ? { launchOptions: { executablePath: caminhoDoChromium } } : {});

test.describe("console do estabelecimento: tema", () => {
  test("dono entra, edita a cor principal, salva rascunho e publica", async ({ page, context }) => {
    await page.goto("/tema");
    await expect(page).toHaveURL(/\/login$/);

    await page.getByLabel("Código do estabelecimento").fill(ESTABELECIMENTO);
    await page.getByLabel("E-mail").fill(EMAIL);
    await page.getByLabel("Senha").fill(SENHA);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page.getByRole("heading", { name: "Resumo" })).toBeVisible();

    const cookies = await context.cookies();
    const sessao = cookies.find((c) => c.name === "__Host-ce_sessao");
    expect(sessao?.httpOnly).toBe(true);
    expect(sessao?.secure).toBe(true);
    expect(sessao?.sameSite).toBe("Lax");
    expect(await page.evaluate(() => document.cookie)).not.toContain("ce_sessao");
    expect(await page.content()).not.toContain("mock-token");

    await page.getByRole("link", { name: "Marca e tema" }).click();
    await expect(page.getByRole("heading", { name: "Marca e tema", level: 1 })).toBeVisible();

    await page.getByLabel("Cor principal", { exact: true }).fill(COR_ESCURA);
    await page.getByLabel("Cor de apoio", { exact: true }).fill(COR_DE_APOIO_CLARA);
    const previa = page.getByTestId("previa-do-tema");
    await expect(previa.locator("div").first()).toHaveAttribute("style", new RegExp(COR_ESCURA, "i"));

    await page.getByRole("button", { name: "Salvar rascunho" }).click();
    await expect(page.getByText("Rascunho salvo.")).toBeVisible();

    await page.getByRole("button", { name: "Publicar" }).click();
    await expect(page.getByText("Tema publicado.")).toBeVisible();

    await page.reload();
    await expect(page.getByLabel("Cor principal", { exact: true })).toHaveValue(COR_ESCURA);
  });
});
