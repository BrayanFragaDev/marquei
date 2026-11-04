import { devices, expect, test } from "@playwright/test";

/**
 * Fluxo do cliente no celular: abrir a vitrine, escolher servico e horario e seguir para entrar.
 *
 * Pre-requisitos (BASE_URL aponta para o app do cliente, ex.: http://localhost:3000):
 *   pnpm mock:api                                   # API simulada, porta 4010
 *   pnpm --filter @marquei/app-cliente build && pnpm --filter @marquei/app-cliente start
 *   BASE_URL=http://localhost:3000 pnpm --filter @marquei/testes exec playwright test agendar-no-celular
 * CHROMIUM_PATH (opcional) usa um Chromium ja instalado quando o do Playwright nao esta disponivel.
 */
const caminhoDoChromium = process.env["CHROMIUM_PATH"];

test.use({
  ...devices["Pixel 7"],
  ...(caminhoDoChromium ? { launchOptions: { executablePath: caminhoDoChromium } } : {}),
});

test.describe("app do cliente no celular", () => {
  test("escolhe servico e horario em poucos toques e segue para entrar", async ({ page }) => {
    await page.goto("/barbearia-do-ze/agendar");

    let toques = 0;
    await page.getByRole("button", { name: /Corte masculino/ }).click();
    toques++;
    await page.getByRole("radio", { name: "10:00" }).check();
    toques++;
    await page.getByRole("button", { name: "Entrar para confirmar" }).click();
    toques++;

    await expect(page).toHaveURL(/\/barbearia-do-ze\/entrar/);
    expect(toques).toBeLessThanOrEqual(5);
  });

  test("dois estabelecimentos mostram marcas diferentes na mesma aplicacao", async ({ page }) => {
    const corPrimaria = async (slug: string): Promise<string> => {
      await page.goto(`/${slug}`);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      return page.evaluate(() =>
        getComputedStyle(document.documentElement).getPropertyValue("--cor-primaria").trim(),
      );
    };
    const barbearia = await corPrimaria("barbearia-do-ze");
    const studio = await corPrimaria("studio-aurora");
    expect(barbearia).not.toBe("");
    expect(studio).not.toBe("");
    expect(barbearia).not.toBe(studio);
  });

  test("o manifesto PWA leva o nome do estabelecimento", async ({ request }) => {
    const resposta = await request.get("/barbearia-do-ze/manifest.webmanifest");
    expect(resposta.ok()).toBe(true);
    const manifesto = (await resposta.json()) as { name: string };
    expect(manifesto.name).toContain("Barbearia do Ze");
  });
});
