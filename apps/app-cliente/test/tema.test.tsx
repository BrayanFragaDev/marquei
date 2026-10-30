import { render, screen, waitFor } from "@testing-library/react";
import { criarClienteDaApi } from "@marquei/api-client";
import { describe, expect, it } from "vitest";
import { CarregadorDoEstabelecimento } from "../src/api/carregador-do-estabelecimento";
import { ProvedorDeTema } from "../src/componentes/provedor-de-tema";
import { criarFetchDoMock } from "./suporte/fetch-do-mock";

async function carregar(slug: string) {
  const { fetch } = criarFetchDoMock();
  const api = criarClienteDaApi({ urlBase: "http://api.teste", fetch });
  const dados = await new CarregadorDoEstabelecimento(api).carregar(slug);
  if (dados === null) throw new TypeError(`sem ${slug}`);
  return dados;
}

describe("ProvedorDeTema", () => {
  it("dois estabelecimentos do mock renderizam marcas diferentes na mesma aplicação", async () => {
    const ze = await carregar("barbearia-do-ze");
    const aurora = await carregar("studio-aurora");

    const { container, unmount } = render(
      <ProvedorDeTema dados={ze}>
        <p>conteúdo</p>
      </ProvedorDeTema>,
    );
    const envoltorioDoZe = container.querySelector<HTMLElement>("[data-tema]");
    expect(envoltorioDoZe?.style.getPropertyValue("--cor-primaria")).toBe("#1d3557");
    expect(envoltorioDoZe?.style.getPropertyValue("--raio-cartao")).toBe("12px");
    expect(document.querySelector('link[href*="family=Inter"]')).not.toBeNull();
    unmount();

    const outro = render(
      <ProvedorDeTema dados={aurora}>
        <p>conteúdo</p>
      </ProvedorDeTema>,
    );
    const envoltorioDaAurora = outro.container.querySelector<HTMLElement>("[data-tema]");
    expect(envoltorioDaAurora?.style.getPropertyValue("--cor-primaria")).toBe("#7a2e5c");
    expect(envoltorioDaAurora?.style.getPropertyValue("--raio-cartao")).toBe("24px");
    expect(envoltorioDaAurora?.style.getPropertyValue("--fonte-familia")).toContain(
      "Playfair Display",
    );
    expect(envoltorioDaAurora?.style.getPropertyValue("--preset-cabecalho")).toBe("capa");
    expect(screen.getByText("conteúdo")).toBeVisible();
  });

  it("aplica as variáveis na raiz do documento e limpa ao sair", async () => {
    const aurora = await carregar("studio-aurora");
    const { unmount } = render(
      <ProvedorDeTema dados={aurora}>
        <span />
      </ProvedorDeTema>,
    );
    await waitFor(() =>
      expect(document.documentElement.style.getPropertyValue("--cor-primaria")).toBe("#7a2e5c"),
    );
    unmount();
    expect(document.documentElement.style.getPropertyValue("--cor-primaria")).toBe("");
  });

  it("carrega só o tema publicado: o contrato público não traz rascunho", async () => {
    const ze = await carregar("barbearia-do-ze");
    expect(ze.tema?.versao).toBeGreaterThan(0);
    expect(Object.keys(ze)).not.toContain("rascunho");
  });

  it("estabelecimento inexistente devolve null", async () => {
    const { fetch } = criarFetchDoMock();
    const api = criarClienteDaApi({ urlBase: "http://api.teste", fetch });
    expect(await new CarregadorDoEstabelecimento(api).carregar("nao-existe-aqui")).toBeNull();
  });
});
