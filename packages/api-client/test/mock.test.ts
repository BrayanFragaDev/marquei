import { readFile } from "node:fs/promises";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { criarClienteDaApi, type ClienteDaApi } from "../src/index";
import { CAMINHO_OPENAPI } from "../scripts/gerar-schema";
import { SENHA_DO_MOCK, TENANTS } from "../mock/dados";
import { iniciarMock, type MockEmExecucao } from "../mock/servidor";

const ze = TENANTS[0];
const aurora = TENANTS[1];
const SERVICO_ZE = ze?.servicos[0]?.id ?? "";
const ZE = ze?.profissionais[0]?.id ?? "";

describe("servidor mock gerado do contrato", () => {
  let mock: MockEmExecucao;
  let api: ClienteDaApi;
  let semToken: ClienteDaApi;

  beforeAll(async () => {
    mock = await iniciarMock({ porta: 0 });
    api = criarClienteDaApi({ urlBase: mock.url, obterToken: () => "mock-token-barbearia-do-ze" });
    semToken = criarClienteDaApi({ urlBase: mock.url });
  });

  afterAll(async () => {
    await mock.fechar();
  });

  it("cobre toda operacao declarada no openapi.yaml (nenhuma responde 404 de rota)", async () => {
    const yaml = await readFile(CAMINHO_OPENAPI, "utf8");
    const declaradas = [...yaml.matchAll(/operationId:\s*(\w+)/g)].map((m) => m[1]).sort();
    const isolado = await iniciarMock({ porta: 0 });
    const api = criarClienteDaApi({
      urlBase: isolado.url,
      obterToken: () => "mock-token-barbearia-do-ze",
    });
    const chamadas: Record<string, () => Promise<{ response: Response }>> = {
      entrar: () =>
        semToken.POST("/v1/auth/login", {
          body: {
            estabelecimento: "barbearia-do-ze",
            email: ze?.dono.email ?? "",
            senha: SENHA_DO_MOCK,
          },
        }),
      obterEstabelecimentoPorSlug: () =>
        semToken.GET("/v1/estabelecimentos/{slug}", {
          params: { path: { slug: "barbearia-do-ze" } },
        }),
      listarServicos: () => api.GET("/v1/servicos"),
      listarHorariosLivres: () =>
        api.GET("/v1/horarios-livres", {
          params: { query: { servicoId: SERVICO_ZE, data: "2026-10-28" } },
        }),
      criarAgendamento: () =>
        api.POST("/v1/agendamentos", {
          body: { servicoId: SERVICO_ZE, profissionalId: ZE, inicio: "2026-10-28T12:00:00.000Z" },
        }),
      cancelarAgendamento: () =>
        api.POST("/v1/agendamentos/{id}/cancelar", {
          params: { path: { id: "a1000000-0000-4000-8000-000000000001" } },
        }),
      obterTemaPublicado: () => api.GET("/v1/tema"),
      listarOpcoesDeTema: () => api.GET("/v1/tema/opcoes"),
      obterRascunhoDoTema: () => api.GET("/v1/tema/rascunho"),
      salvarRascunhoDoTema: async () => {
        const atual = await api.GET("/v1/tema");
        if (!atual.data) throw new Error("tema do mock ausente");
        return api.PUT("/v1/tema/rascunho", { body: atual.data.tokens });
      },
      restaurarTemaPadraoDaVertical: () => api.POST("/v1/tema/rascunho/restaurar-padrao"),
      publicarTema: () => api.POST("/v1/tema/publicar"),
    };
    expect(Object.keys(chamadas).sort()).toEqual(declaradas);
    for (const [nome, chamar] of Object.entries(chamadas)) {
      const { response } = await chamar();
      expect(response.status, nome).not.toBe(404);
      expect(response.status, nome).toBeLessThan(500);
    }
    await isolado.fechar();
  });

  it("vitrine publica devolve marca, vocabulario e tema do estabelecimento", async () => {
    const { data } = await semToken.GET("/v1/estabelecimentos/{slug}", {
      params: { path: { slug: "studio-aurora" } },
    });
    expect(data?.nome).toBe("Studio Aurora");
    expect(data?.vocabulario["profissional"]).toBe("cabeleireira");
    expect(data?.tema?.versao).toBe(1);
    const { response } = await semToken.GET("/v1/estabelecimentos/{slug}", {
      params: { path: { slug: "nao-existe" } },
    });
    expect(response.status).toBe(404);
  });

  it("rotas autenticadas respondem 401 sem token", async () => {
    const { response, error } = await semToken.GET("/v1/servicos");
    expect(response.status).toBe(401);
    expect(error?.codigo).toBe("sessao_invalida");
  });

  it("login: senha errada 401, certa devolve o contrato", async () => {
    const errado = await semToken.POST("/v1/auth/login", {
      body: { estabelecimento: "studio-aurora", email: aurora?.dono.email ?? "", senha: "errada" },
    });
    expect(errado.response.status).toBe(401);
    const certo = await semToken.POST("/v1/auth/login", {
      body: {
        estabelecimento: "studio-aurora",
        email: aurora?.dono.email ?? "",
        senha: SENHA_DO_MOCK,
      },
    });
    expect(certo.data).toMatchObject({
      token: "mock-token-studio-aurora",
      papel: "dono",
      estabelecimentoId: aurora?.estabelecimento.id,
    });
  });

  it("cada token enxerga so os servicos do seu estabelecimento", async () => {
    const doZe = await api.GET("/v1/servicos");
    const daAurora = await criarClienteDaApi({
      urlBase: mock.url,
      obterToken: () => "mock-token-studio-aurora",
    }).GET("/v1/servicos");
    expect(doZe.data?.itens.map((s) => s.nome)).toContain("Barba");
    expect(daAurora.data?.itens.map((s) => s.nome)).toContain("Escova");
    expect(doZe.data?.itens).not.toEqual(daAurora.data?.itens);
  });

  it("horarios livres: respeita turnos, passo, domingo fechado e o horario ja reservado", async () => {
    const terca = await api.GET("/v1/horarios-livres", {
      params: { query: { servicoId: SERVICO_ZE, data: "2026-10-27", profissionalId: ZE } },
    });
    const inicios = terca.data?.itens.map((i) => i.inicio) ?? [];
    expect(inicios[0]).toBe("2026-10-27T12:00:00.000Z");
    expect(inicios).not.toContain("2026-10-27T13:00:00.000Z"); // reservado no seed
    expect(inicios).toContain("2026-10-27T13:30:00.000Z");
    const domingo = await api.GET("/v1/horarios-livres", {
      params: { query: { servicoId: SERVICO_ZE, data: "2026-11-01" } },
    });
    expect(domingo.data?.itens).toEqual([]);
  });

  it("horarios livres: entradas invalidas e inexistentes", async () => {
    const semData = await api.GET("/v1/horarios-livres", {
      params: { query: { servicoId: SERVICO_ZE } as never },
    });
    expect(semData.response.status).toBe(400);
    const outroServico = await api.GET("/v1/horarios-livres", {
      params: { query: { servicoId: "00000000-0000-4000-8000-0000000000ff", data: "2026-10-28" } },
    });
    expect(outroServico.response.status).toBe(404);
  });

  it("agendar tira o horario da lista, repetir da 409 e passado da 422", async () => {
    const inicio = "2026-10-29T14:00:00.000Z";
    const criado = await api.POST("/v1/agendamentos", {
      body: { servicoId: SERVICO_ZE, profissionalId: ZE, inicio },
    });
    expect(criado.response.status).toBe(201);
    expect(criado.data).toMatchObject({
      status: "confirmado",
      precoCentavos: 4500,
      fim: "2026-10-29T14:30:00.000Z",
    });
    const repetido = await api.POST("/v1/agendamentos", {
      body: { servicoId: SERVICO_ZE, profissionalId: ZE, inicio },
    });
    expect(repetido.response.status).toBe(409);
    expect(repetido.error?.codigo).toBe("horario_indisponivel");
    const lista = await api.GET("/v1/horarios-livres", {
      params: { query: { servicoId: SERVICO_ZE, data: "2026-10-29", profissionalId: ZE } },
    });
    expect(lista.data?.itens.map((i) => i.inicio)).not.toContain(inicio);
    const passado = await api.POST("/v1/agendamentos", {
      body: { servicoId: SERVICO_ZE, profissionalId: ZE, inicio: "2026-10-26T11:00:00.000Z" },
    });
    expect(passado.response.status).toBe(422);
    expect(passado.error?.codigo).toBe("agendamento_no_passado");
  });

  it("cancelar libera o horario; repetir da 409; desconhecido da 404", async () => {
    const inicio = "2026-10-30T14:00:00.000Z";
    const criado = await api.POST("/v1/agendamentos", {
      body: { servicoId: SERVICO_ZE, profissionalId: ZE, inicio },
    });
    const id = criado.data?.id ?? "";
    const cancelado = await api.POST("/v1/agendamentos/{id}/cancelar", {
      params: { path: { id } },
    });
    expect(cancelado.data?.status).toBe("cancelado");
    const repetido = await api.POST("/v1/agendamentos/{id}/cancelar", { params: { path: { id } } });
    expect(repetido.error?.codigo).toBe("agendamento_nao_cancelavel");
    const desconhecido = await api.POST("/v1/agendamentos/{id}/cancelar", {
      params: { path: { id: "00000000-0000-4000-8000-0000000000ff" } },
    });
    expect(desconhecido.response.status).toBe(404);
    const lista = await api.GET("/v1/horarios-livres", {
      params: { query: { servicoId: SERVICO_ZE, data: "2026-10-30", profissionalId: ZE } },
    });
    expect(lista.data?.itens.map((i) => i.inicio)).toContain(inicio);
  });

  it("fora da antecedencia minima o cancelamento e recusado (409)", async () => {
    // Agora = segunda 09:00 local; a segunda 10:30 local fica a 90 min, dentro dos 120 da politica.
    const criado = await api.POST("/v1/agendamentos", {
      body: { servicoId: SERVICO_ZE, profissionalId: ZE, inicio: "2026-10-26T13:30:00.000Z" },
    });
    expect(criado.response.status).toBe(201);
    const r = await api.POST("/v1/agendamentos/{id}/cancelar", {
      params: { path: { id: criado.data?.id ?? "" } },
    });
    expect(r.response.status).toBe(409);
    expect(r.error?.codigo).toBe("fora_do_prazo_de_cancelamento");
  });

  it("tema: salvar rascunho nao muda o publicado; publicar promove e sobe a versao", async () => {
    const base = await api.GET("/v1/tema");
    const tokens = base.data?.tokens;
    if (!tokens) throw new Error("tema do mock ausente");
    await api.PUT("/v1/tema/rascunho", { body: { ...tokens, raio: "reto" } });
    expect((await api.GET("/v1/tema")).data?.tokens.raio).toBe("suave");
    expect((await api.GET("/v1/tema/rascunho")).data).toMatchObject({ origem: "rascunho" });
    const publicado = await api.POST("/v1/tema/publicar");
    expect(publicado.data).toMatchObject({
      origem: "publicado",
      versao: (base.data?.versao ?? 0) + 1,
    });
    expect(publicado.data?.tokens.raio).toBe("reto");
  });

  it("e deterministico: duas instancias dao exatamente as mesmas respostas", async () => {
    const percorrer = async (): Promise<unknown[]> => {
      const m = await iniciarMock({ porta: 0 });
      try {
        const c = criarClienteDaApi({ urlBase: m.url, obterToken: () => "t" });
        const criado = await c.POST("/v1/agendamentos", {
          body: { servicoId: SERVICO_ZE, profissionalId: ZE, inicio: "2026-10-28T12:00:00.000Z" },
        });
        const lista = await c.GET("/v1/horarios-livres", {
          params: { query: { servicoId: SERVICO_ZE, data: "2026-10-28" } },
        });
        const vitrine = await c.GET("/v1/estabelecimentos/{slug}", {
          params: { path: { slug: "barbearia-do-ze" } },
        });
        return [criado.data, lista.data, vitrine.data];
      } finally {
        await m.fechar();
      }
    };
    expect(await percorrer()).toEqual(await percorrer());
  });
});
