import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import argon2 from "argon2";
import type pg from "pg";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  EstabelecimentoId,
  Instante,
  Papel,
  Sessao,
  UsuarioId,
  type EmissorDeToken,
  type TokenEmitido,
} from "@marquei/dominio";
import type { components } from "../../../../../packages/api-client/src/gerado/schema";
import { AppModule } from "../../../src/app.module";
import { RelogioDoSistema } from "../../../src/seguranca/relogio-do-sistema";
import { EmissorDeTokenJose } from "../../../src/seguranca/tokens/emissor-de-token-jose";
import { TOKEN_EMISSOR_ESTABELECIMENTO } from "../../../src/seguranca/tokens/tokens-de-injecao";
import { SEGREDO_ESTABELECIMENTO, SEGREDO_PLATAFORMA } from "../../identidade/suporte";
import { criarPoolAdmin } from "../suporte/banco";
import { criarTenant, removerTenant, type Tenant } from "../suporte/fixtures";
import { TERCA, iso, limparAgenda, prepararAgenda } from "./suporte-agenda";

type Esquemas = components["schemas"];
/** `satisfies` obriga a lista a acompanhar o OpenAPI gerado: campo novo no contrato quebra a compilacao. */
const CHAVES = {
  estabelecimento: {
    id: 1,
    slug: 1,
    nome: 1,
    vertical: 1,
    vocabulario: 1,
    fusoHorario: 1,
    tema: 1,
  } satisfies Record<keyof Esquemas["EstabelecimentoPublico"], 1>,
  servico: { id: 1, nome: 1, duracaoMinutos: 1, precoCentavos: 1 } satisfies Record<
    keyof Esquemas["Servico"],
    1
  >,
  horarios: { data: 1, fusoHorario: 1, itens: 1 } satisfies Record<
    keyof Esquemas["HorariosLivres"],
    1
  >,
  horario: { profissionalId: 1, inicio: 1, fim: 1 } satisfies Record<
    keyof Esquemas["HorarioLivre"],
    1
  >,
  agendamento: {
    id: 1,
    servicoId: 1,
    profissionalId: 1,
    inicio: 1,
    fim: 1,
    status: 1,
    precoCentavos: 1,
  } satisfies Record<keyof Esquemas["Agendamento"], 1>,
  erro: { codigo: 1, mensagem: 1 } satisfies Record<Exclude<keyof Esquemas["Erro"], "detalhes">, 1>,
  login: { token: 1, expiraEm: 1, usuarioId: 1, papel: 1, estabelecimentoId: 1 } satisfies Record<
    keyof Esquemas["LoginResposta"],
    1
  >,
};
const chaves = (modelo: object): string[] => Object.keys(modelo).sort();

const SENHA = "cavalo-bateria-grampo-7";
const PREFIXO = "teste-cliente:";

/**
 * O emissor real so conhece a audiencia do console. Enquanto o AS nao publica o verificador do
 * app do cliente, este emissor de teste aceita `teste-cliente:<tenant>:<clienteId>` e delega o
 * resto (tokens de dono/gestor, via login real) ao emissor verdadeiro.
 */
class EmissorComClientesDeTeste implements EmissorDeToken {
  constructor(private readonly real: EmissorDeToken) {}

  emitir(sessao: Sessao): Promise<TokenEmitido> {
    return this.real.emitir(sessao);
  }

  verificar(token: string): Promise<Sessao> {
    if (!token.startsWith(PREFIXO)) return this.real.verificar(token);
    const [tenant, cliente] = token.slice(PREFIXO.length).split(":");
    return Promise.resolve(
      Sessao.criar({
        usuarioId: UsuarioId.de(cliente ?? ""),
        papel: Papel.ClienteFinal,
        tenant: EstabelecimentoId.de(tenant ?? ""),
        emitidaEm: Instante.deEpochMs(Date.now()),
        validadeEmMinutos: 30,
      }),
    );
  }
}

describe("API de agenda e catalogo: contrato HTTP, tenant e concorrencia", () => {
  let app: INestApplication;
  let pool: pg.Pool;
  let a: Tenant;
  let b: Tenant;
  let clienteA2: string;
  const tokenCliente = (t: Tenant, clienteId = t.clienteId): string =>
    `${PREFIXO}${t.estabelecimentoId}:${clienteId}`;
  const get = (url: string, token?: string) => {
    const r = request(app.getHttpServer()).get(url);
    return token ? r.set("Authorization", `Bearer ${token}`) : r;
  };
  const post = (url: string, token: string) =>
    request(app.getHttpServer()).post(url).set("Authorization", `Bearer ${token}`);
  const corpo = (t: Tenant, inicio: string) => ({
    servicoId: t.servicoId,
    profissionalId: t.profissionalId,
    inicio,
  });
  const eventos = async (t: Tenant, nome: string): Promise<number> =>
    Number(
      (
        await pool.query<{ n: string }>(
          "SELECT count(*) AS n FROM evento_analitico WHERE estabelecimento_id = $1 AND nome = $2",
          [t.estabelecimentoId, nome],
        )
      ).rows[0]?.n,
    );

  beforeAll(async () => {
    process.env["JWT_SEGREDO_ESTABELECIMENTO"] = SEGREDO_ESTABELECIMENTO;
    process.env["JWT_SEGREDO_PLATAFORMA"] = SEGREDO_PLATAFORMA;
    pool = criarPoolAdmin();
    a = await criarTenant(pool, "93");
    b = await criarTenant(pool, "94");
    await prepararAgenda(pool, a);
    await prepararAgenda(pool, b);
    // O agendamento criado pelo fixture (2030-01-10) nao interfere: o dia testado e 2030-01-15.
    const hash = await argon2.hash(SENHA);
    await pool.query("UPDATE usuario SET senha_hash = $1 WHERE id = ANY($2)", [
      hash,
      [a.usuarioId, b.usuarioId],
    ]);
    const outro = await pool.query<{ id: string }>(
      `INSERT INTO cliente_final (estabelecimento_id, telefone) VALUES ($1, '+5511999990093') RETURNING id`,
      [a.estabelecimentoId],
    );
    clienteA2 = outro.rows[0]?.id ?? "";
    const real = new EmissorDeTokenJose({
      audiencia: "console-estabelecimento",
      segredo: () => SEGREDO_ESTABELECIMENTO,
      relogio: new RelogioDoSistema(),
    });
    const modulo = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(TOKEN_EMISSOR_ESTABELECIMENTO)
      .useValue(new EmissorComClientesDeTeste(real))
      .compile();
    app = modulo.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await pool.query("DELETE FROM agendamento WHERE estabelecimento_id = ANY($1)", [
      [a.estabelecimentoId, b.estabelecimentoId],
    ]);
    await limparAgenda(pool, a.estabelecimentoId);
    await limparAgenda(pool, b.estabelecimentoId);
    await removerTenant(pool, a.estabelecimentoId);
    await removerTenant(pool, b.estabelecimentoId);
    await pool.end();
  });

  async function tokenDoDono(slug: string, email: string): Promise<string> {
    const r = await request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ estabelecimento: slug, email, senha: SENHA });
    return r.body.token as string;
  }

  describe("GET /v1/estabelecimentos/{slug} (publica)", () => {
    it("devolve nome, vertical, vocabulario e fuso sem exigir token; tema nulo sem publicado", async () => {
      const r = await get("/v1/estabelecimentos/teste-93");
      expect(r.status).toBe(200);
      expect(r.body).toMatchObject({
        id: a.estabelecimentoId,
        slug: "teste-93",
        vertical: "barbearia",
        fusoHorario: "America/Sao_Paulo",
        tema: null,
      });
      expect(r.body.vocabulario.profissional).toBe("barbeiro");
    });

    it("so expoe o tema publicado; o rascunho nunca aparece", async () => {
      await pool.query(
        `INSERT INTO tema (estabelecimento_id, estado, tokens) VALUES
           ($1, 'rascunho', '{"cor":"rascunho-secreto"}'), ($1, 'publicado', '{"cor":"azul"}')`,
        [a.estabelecimentoId],
      );
      const r = await get("/v1/estabelecimentos/teste-93");
      expect(r.body.tema).toEqual({ versao: 1, tokens: { cor: "azul" } });
      expect(JSON.stringify(r.body)).not.toContain("rascunho-secreto");
    });

    it("slug inexistente ou de estabelecimento suspenso responde 404 igual; slug malformado, 400", async () => {
      await pool.query("UPDATE estabelecimento SET status = 'suspenso' WHERE id = $1", [
        b.estabelecimentoId,
      ]);
      try {
        const suspenso = await get("/v1/estabelecimentos/teste-94");
        const inexistente = await get("/v1/estabelecimentos/nao-existe-93");
        expect(suspenso.status).toBe(404);
        expect(inexistente.status).toBe(404);
        expect(suspenso.body).toEqual(inexistente.body);
        expect(suspenso.body.codigo).toBe("estabelecimento_nao_encontrado");
      } finally {
        await pool.query("UPDATE estabelecimento SET status = 'ativo' WHERE id = $1", [
          b.estabelecimentoId,
        ]);
      }
      expect((await get("/v1/estabelecimentos/A_B")).status).toBe(400);
    });
  });

  describe("GET /v1/servicos", () => {
    it("exige token", async () => {
      expect((await get("/v1/servicos")).status).toBe(401);
    });

    it("cada tenant ve so os proprios servicos (token de cliente e de dono)", async () => {
      const ra = await get("/v1/servicos", tokenCliente(a));
      const rb = await get("/v1/servicos", tokenCliente(b));
      expect(ra.body).toEqual({
        itens: [{ id: a.servicoId, nome: "Corte", duracaoMinutos: 30, precoCentavos: 4500 }],
      });
      expect(rb.body.itens.map((s: { id: string }) => s.id)).toEqual([b.servicoId]);
      const dono = await tokenDoDono("teste-93", "dono-93@exemplo.test");
      expect((await get("/v1/servicos", dono)).body).toEqual(ra.body);
    });

    it("tenant informado pelo cliente e rejeitado", async () => {
      const r = await get(`/v1/servicos?estabelecimentoId=${b.estabelecimentoId}`, tokenCliente(a));
      expect(r.status).toBe(403);
      expect(r.body.codigo).toBe("tenant_divergente");
    });
  });

  describe("GET /v1/horarios-livres", () => {
    const url = (t: Tenant, extra = "") =>
      `/v1/horarios-livres?servicoId=${t.servicoId}&data=${TERCA}${extra}`;

    it("lista os horarios do dia no passo do estabelecimento, respeitando o expediente", async () => {
      const r = await get(url(a), tokenCliente(a));
      expect(r.status).toBe(200);
      expect(r.body.data).toBe(TERCA);
      expect(r.body.fusoHorario).toBe("America/Sao_Paulo");
      // 09:00-12:00, servico de 30 min, passo de 15: 09:00 ... 11:30 = 11 horarios.
      expect(r.body.itens).toHaveLength(11);
      expect(r.body.itens[0]).toEqual({
        profissionalId: a.profissionalId,
        inicio: iso(12),
        fim: iso(12, 30),
      });
    });

    it("dia sem expediente (quarta) vem vazio", async () => {
      const r = await get(
        `/v1/horarios-livres?servicoId=${a.servicoId}&data=2030-01-16`,
        tokenCliente(a),
      );
      expect(r.body.itens).toEqual([]);
    });

    it("entradas invalidas respondem 400 com codigo estavel", async () => {
      for (const consulta of [
        `servicoId=${a.servicoId}`,
        `servicoId=${a.servicoId}&data=15/01/2030`,
        `servicoId=nao-e-uuid&data=${TERCA}`,
        `servicoId=${a.servicoId}&data=${TERCA}&profissionalId=x`,
      ]) {
        const r = await get(`/v1/horarios-livres?${consulta}`, tokenCliente(a));
        expect(r.status).toBe(400);
        expect(typeof r.body.codigo).toBe("string");
      }
    });

    it("isolamento: servico ou profissional do outro tenant respondem 404", async () => {
      const servicoDeB = await get(url(b), tokenCliente(a));
      expect(servicoDeB.status).toBe(404);
      expect(servicoDeB.body.codigo).toBe("servico_nao_encontrado");
      const profissionalDeB = await get(
        url(a, `&profissionalId=${b.profissionalId}`),
        tokenCliente(a),
      );
      expect(profissionalDeB.status).toBe(404);
      expect(profissionalDeB.body.codigo).toBe("profissional_nao_encontrado");
    });

    it("sem token responde 401", async () => {
      expect((await get(url(a))).status).toBe(401);
    });
  });

  describe("POST /v1/agendamentos e cancelamento", () => {
    it("cliente agenda: 201, dados do contrato, evento no outbox na mesma transacao", async () => {
      const antes = await eventos(a, "agendamento_criado");
      const r = await post("/v1/agendamentos", tokenCliente(a)).send(corpo(a, iso(12)));
      expect(r.status).toBe(201);
      expect(r.body).toMatchObject({
        servicoId: a.servicoId,
        profissionalId: a.profissionalId,
        inicio: iso(12),
        fim: iso(12, 30),
        status: "confirmado",
        precoCentavos: 4500,
      });
      expect(await eventos(a, "agendamento_criado")).toBe(antes + 1);
      const linha = await pool.query<{ cliente_id: string; ocupa_ate: Date }>(
        "SELECT cliente_id, ocupa_ate FROM agendamento WHERE id = $1",
        [r.body.id],
      );
      expect(linha.rows[0]?.cliente_id).toBe(a.clienteId);
      expect(linha.rows[0]?.ocupa_ate.toISOString()).toBe(iso(12, 40));
    });

    it("o horario ocupado (com o intervalo) sai da lista e nova tentativa recebe 409", async () => {
      const lista = await get(
        `/v1/horarios-livres?servicoId=${a.servicoId}&data=${TERCA}`,
        tokenCliente(a),
      );
      const inicios = lista.body.itens.map((i: { inicio: string }) => i.inicio);
      expect(inicios).not.toContain(iso(12));
      expect(inicios).not.toContain(iso(12, 30)); // dentro do intervalo de 10 min (ate 12:40)
      expect(inicios).toContain(iso(12, 45));
      const antes = await eventos(a, "agendamento_criado");
      const r = await post("/v1/agendamentos", tokenCliente(a, clienteA2)).send(corpo(a, iso(12)));
      expect(r.status).toBe(409);
      expect(r.body.codigo).toBe("horario_indisponivel");
      expect(await eventos(a, "agendamento_criado")).toBe(antes);
    });

    it("dois pedidos simultaneos ao mesmo horario: um 201 e um 409, uma linha confirmada", async () => {
      const respostas = await Promise.all([
        post("/v1/agendamentos", tokenCliente(a)).send(corpo(a, iso(14))),
        post("/v1/agendamentos", tokenCliente(a, clienteA2)).send(corpo(a, iso(14))),
      ]);
      // 14:00Z = 11:00 local, dentro do expediente.
      expect(respostas.map((r) => r.status).sort()).toEqual([201, 409]);
      const linhas = await pool.query(
        "SELECT 1 FROM agendamento WHERE profissional_id = $1 AND inicio = $2 AND status = 'confirmado'",
        [a.profissionalId, iso(14)],
      );
      expect(linhas.rowCount).toBe(1);
    });

    it("regras: passado 422, fora do expediente 409, equipe nao agenda (403), corpo invalido 400", async () => {
      expect(
        (await post("/v1/agendamentos", tokenCliente(a)).send(corpo(a, "2020-01-14T12:00:00.000Z")))
          .body.codigo,
      ).toBe("agendamento_no_passado");
      expect((await post("/v1/agendamentos", tokenCliente(a)).send(corpo(a, iso(20)))).status).toBe(
        409,
      );
      const dono = await tokenDoDono("teste-93", "dono-93@exemplo.test");
      const equipe = await post("/v1/agendamentos", dono).send(corpo(a, iso(13)));
      expect(equipe.status).toBe(403);
      expect(equipe.body.codigo).toBe("acao_nao_permitida");
      expect(
        (await post("/v1/agendamentos", tokenCliente(a)).send({ servicoId: a.servicoId })).status,
      ).toBe(400);
      expect(
        (await post("/v1/agendamentos", tokenCliente(a)).send(corpo(a, "amanha"))).status,
      ).toBe(400);
    });

    it("isolamento: tenant vindo do cliente e rejeitado e dados do outro tenant sao 404", async () => {
      const comTenant = await post("/v1/agendamentos", tokenCliente(a)).send({
        ...corpo(a, iso(13)),
        estabelecimentoId: b.estabelecimentoId,
      });
      expect(comTenant.status).toBe(403);
      const servicoDeB = await post("/v1/agendamentos", tokenCliente(a)).send(corpo(b, iso(13)));
      expect(servicoDeB.status).toBe(404);
      expect(servicoDeB.body.codigo).toBe("servico_nao_encontrado");
      const profissionalDeB = await post("/v1/agendamentos", tokenCliente(a)).send({
        ...corpo(a, iso(13)),
        profissionalId: b.profissionalId,
      });
      expect(profissionalDeB.status).toBe(404);
      const doB = await pool.query(
        "SELECT 1 FROM agendamento WHERE estabelecimento_id = $1 AND inicio = $2",
        [b.estabelecimentoId, iso(13)],
      );
      expect(doB.rowCount).toBe(0);
    });

    describe("cancelar", () => {
      let agendamentoId: string;
      beforeAll(async () => {
        const r = await post("/v1/agendamentos", tokenCliente(a)).send(corpo(a, iso(13)));
        agendamentoId = r.body.id as string;
      });

      it("outro cliente do mesmo estabelecimento e o tenant B recebem 404", async () => {
        const outroCliente = await post(
          `/v1/agendamentos/${agendamentoId}/cancelar`,
          tokenCliente(a, clienteA2),
        );
        expect(outroCliente.status).toBe(404);
        expect(outroCliente.body.codigo).toBe("agendamento_nao_encontrado");
        const dono = await tokenDoDono("teste-94", "dono-94@exemplo.test");
        for (const token of [tokenCliente(b), dono]) {
          const r = await post(`/v1/agendamentos/${agendamentoId}/cancelar`, token);
          expect(r.status).toBe(404);
        }
        const intacto = await pool.query<{ status: string }>(
          "SELECT status FROM agendamento WHERE id = $1",
          [agendamentoId],
        );
        expect(intacto.rows[0]?.status).toBe("confirmado");
      });

      it("id que nao e UUID responde 400", async () => {
        expect((await post("/v1/agendamentos/abc/cancelar", tokenCliente(a))).status).toBe(400);
      });

      it("o proprio cliente cancela: 200, horario liberado e evento com quem cancelou", async () => {
        const antes = await eventos(a, "agendamento_cancelado");
        const r = await post(`/v1/agendamentos/${agendamentoId}/cancelar`, tokenCliente(a));
        expect(r.status).toBe(200);
        expect(r.body.status).toBe("cancelado");
        expect(await eventos(a, "agendamento_cancelado")).toBe(antes + 1);
        const evento = await pool.query<{ propriedades: Record<string, unknown> }>(
          `SELECT propriedades FROM evento_analitico
            WHERE estabelecimento_id = $1 AND nome = 'agendamento_cancelado' ORDER BY gravado_em DESC LIMIT 1`,
          [a.estabelecimentoId],
        );
        expect(evento.rows[0]?.propriedades).toMatchObject({
          agendamento_id: agendamentoId,
          quem_cancelou: "cliente_final",
          dentro_da_politica: true,
        });
        const lista = await get(
          `/v1/horarios-livres?servicoId=${a.servicoId}&data=${TERCA}`,
          tokenCliente(a),
        );
        expect(lista.body.itens.map((i: { inicio: string }) => i.inicio)).toContain(iso(13));
      });

      it("cancelar de novo responde 409 e o dono cancela agendamento de qualquer cliente", async () => {
        const repetido = await post(`/v1/agendamentos/${agendamentoId}/cancelar`, tokenCliente(a));
        expect(repetido.status).toBe(409);
        expect(repetido.body.codigo).toBe("agendamento_nao_cancelavel");
        const novo = await post("/v1/agendamentos", tokenCliente(a, clienteA2)).send(
          corpo(a, iso(13)),
        );
        const dono = await tokenDoDono("teste-93", "dono-93@exemplo.test");
        const r = await post(`/v1/agendamentos/${novo.body.id}/cancelar`, dono);
        expect(r.status).toBe(200);
        expect(r.body.status).toBe("cancelado");
      });

      it("fora da antecedencia minima o cliente recebe 409 e o dono consegue cancelar", async () => {
        await pool.query(
          "UPDATE estabelecimento SET antecedencia_cancelamento_minutos = 100000000 WHERE id = $1",
          [a.estabelecimentoId],
        );
        try {
          const criado = await post("/v1/agendamentos", tokenCliente(a)).send(corpo(a, iso(13)));
          expect(criado.status).toBe(201);
          const cliente = await post(
            `/v1/agendamentos/${criado.body.id}/cancelar`,
            tokenCliente(a),
          );
          expect(cliente.status).toBe(409);
          expect(cliente.body.codigo).toBe("fora_do_prazo_de_cancelamento");
          const dono = await tokenDoDono("teste-93", "dono-93@exemplo.test");
          expect((await post(`/v1/agendamentos/${criado.body.id}/cancelar`, dono)).status).toBe(
            200,
          );
        } finally {
          await pool.query(
            "UPDATE estabelecimento SET antecedencia_cancelamento_minutos = 120 WHERE id = $1",
            [a.estabelecimentoId],
          );
        }
      });
    });
  });

  describe("contrato: as respostas reais tem exatamente os campos do OpenAPI", () => {
    it("estabelecimento, servicos, horarios livres, agendamento, erro e login", async () => {
      const estabelecimento = await get("/v1/estabelecimentos/teste-93");
      expect(chaves(estabelecimento.body)).toEqual(chaves(CHAVES.estabelecimento));
      const servicos = await get("/v1/servicos", tokenCliente(a));
      expect(chaves(servicos.body.itens[0])).toEqual(chaves(CHAVES.servico));
      const horarios = await get(
        `/v1/horarios-livres?servicoId=${a.servicoId}&data=${TERCA}`,
        tokenCliente(a),
      );
      expect(chaves(horarios.body)).toEqual(chaves(CHAVES.horarios));
      expect(chaves(horarios.body.itens[0])).toEqual(chaves(CHAVES.horario));
      const criado = await post("/v1/agendamentos", tokenCliente(a)).send(corpo(a, iso(12, 45)));
      expect(criado.status).toBe(201);
      expect(chaves(criado.body)).toEqual(chaves(CHAVES.agendamento));
      const cancelado = await post(`/v1/agendamentos/${criado.body.id}/cancelar`, tokenCliente(a));
      expect(chaves(cancelado.body)).toEqual(chaves(CHAVES.agendamento));
      const erro = await get("/v1/servicos");
      expect(chaves(erro.body)).toEqual(chaves(CHAVES.erro));
      const login = await request(app.getHttpServer())
        .post("/v1/auth/login")
        .send({ estabelecimento: "teste-93", email: "dono-93@exemplo.test", senha: SENHA });
      expect(chaves(login.body)).toEqual(chaves(CHAVES.login));
    });
  });
});
