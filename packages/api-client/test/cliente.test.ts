import { describe, expect, it } from "vitest";
import { criarClienteDaApi } from "../src/index";
import { gerarSchema, CAMINHO_SCHEMA } from "../scripts/gerar-schema";
import { readFile } from "node:fs/promises";

describe("cliente gerado", () => {
  it("schema.ts esta em dia com o openapi.yaml", async () => {
    const atual = await readFile(CAMINHO_SCHEMA, "utf8");
    expect(atual).toBe(await gerarSchema());
  });

  it("envia o token bearer e nunca um estabelecimento", async () => {
    let requisicao: Request | undefined;
    const cliente = criarClienteDaApi({
      urlBase: "http://api.teste",
      obterToken: () => "token-123",
      fetch: async (r) => {
        requisicao = r;
        return Response.json({ itens: [] });
      },
    });
    const { data } = await cliente.GET("/v1/servicos");
    expect(data).toEqual({ itens: [] });
    expect(requisicao?.headers.get("Authorization")).toBe("Bearer token-123");
    expect(requisicao?.url).toBe("http://api.teste/v1/servicos");
  });

  it("monta a rota publica com o slug", async () => {
    let url = "";
    const cliente = criarClienteDaApi({
      urlBase: "http://api.teste",
      fetch: async (r) => {
        url = r.url;
        return Response.json({}, { status: 404 });
      },
    });
    await cliente.GET("/v1/estabelecimentos/{slug}", { params: { path: { slug: "loja-a" } } });
    expect(url).toBe("http://api.teste/v1/estabelecimentos/loja-a");
  });
});
