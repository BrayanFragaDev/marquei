import { expect, test } from "@playwright/test";

// Fumaca de INFRAESTRUTURA: prova que navegador, renderizacao e assercoes funcionam.
// Nao testa nenhum app (ainda nao existem). Os testes reais usam page.goto("/") com BASE_URL.
test.describe("infraestrutura e2e", () => {
  test("abre o navegador, renderiza conteudo e executa assercoes", async ({ page }) => {
    await page.setContent(`
      <main lang="pt-BR">
        <h1>Fumaca</h1>
        <button type="button" onclick="document.querySelector('p').textContent = 'clicado'">
          Acionar
        </button>
        <p>aguardando</p>
      </main>
    `);

    await expect(page.getByRole("heading", { name: "Fumaca" })).toBeVisible();
    await page.getByRole("button", { name: "Acionar" }).click();
    await expect(page.locator("p")).toHaveText("clicado");
  });
});
