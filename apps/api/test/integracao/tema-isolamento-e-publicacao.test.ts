import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import type pg from "pg";
import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
import {
  Audiencia,
  EstabelecimentoId,
  Instante,
  Papel,
  Sessao,
  UsuarioId,
  type EmissorDeToken,
  type TokenEmitido,
} from "@marquei/dominio";
import { CorHex, temaPadraoDaVertical, type DadosDoTema } from "@marquei/design-tokens";
import { AppModule } from "../../src/app.module";
import { ExecutorTransacional, ProvedorDeTransacao } from "../../src/nucleo";
import { TemaRepositorioPostgres } from "../../src/modulos/tema/infra/tema-repositorio-postgres";
import { RelogioDoSistema } from "../../src/seguranca/relogio-do-sistema";
import { EmissorDeTokenJose } from "../../src/seguranca/tokens/emissor-de-token-jose";
import { TOKEN_EMISSOR_ESTABELECIMENTO } from "../../src/seguranca/tokens/tokens-de-injecao";
import { SEGREDO_ESTABELECIMENTO, SEGREDO_PLATAFORMA } from "../identidade/suporte";
import { criarPoolAdmin } from "./suporte/banco";
import { criarTenant, removerTenant, type Tenant } from "./suporte/fixtures";

const PREFIXO_CLIENTE = "cliente:";

/**
 * O emissor do app do cliente (audiencia `app-cliente`) ainda nao esta ligado na API (AS).
 * Este emissor de teste delega ao real e, para tokens `cliente:<tenant>`, devolve uma sessao
 * de `cliente_final`, que atravessa guard, interceptor de tenant e controller reais.
 */
class EmissorComClienteFinal implements EmissorDeToken {
  constructor(private readonly real: EmissorDeToken) {}

  emitir(sessao: Sessao): Promise<TokenEmitido> {
    return this.real.emitir(sessao);
  }

  verificar(token: string): Promise<Sessao> {
    if (!token.startsWith(PREFIXO_CLIENTE)) return this.real.verificar(token);
    return Promise.resolve(
      Sessao.reconstituir({
        usuarioId: UsuarioId.de("00000000-0000-4000-8000-0000000000c1"),
        papel: Papel.ClienteFinal,
        tenant: EstabelecimentoId.de(token.slice(PREFIXO_CLIENTE.length)),
        audiencia: Audiencia.AppCliente,
        emitidaEm: Instante.deEpochMs(Date.now()),
        expiraEm: Instante.deEpochMs(Date.now() + 600_000),
      }),
    );
  }
}

describe("tema: isolamento entre estabelecimentos, papeis e publicacao (DS-2)", () => {
  let app: INestApplication;
  let pool: pg.Pool;
  let a: Tenant;
  let b: Tenant;
  let emissor: EmissorDeToken;
  const claro = temaPadraoDaVertical("outro");
  const ilegivel = claro.comCores(claro.cores.comCor("textoSuave", CorHex.criar("#dddddd")));
  const corDeA = claro.comCorPrimaria(CorHex.criar("#0a7d4f"));

  const tokenDe = async (papel: Papel, tenant: Tenant): Promise<string> =>
    (
      await emissor.emitir(
        Sessao.criar({
          usuarioId: UsuarioId.de(tenant.usuarioId),
          papel,
          tenant: EstabelecimentoId.de(tenant.estabelecimentoId),
          emitidaEm: Instante.deEpochMs(Date.now()),
          validadeEmMinutos: 10,
        }),
      )
    ).token;
  const dono = (t: Tenant) => tokenDe(Papel.Dono, t);
  const com = (token: string, r: request.Test): request.Test =>
    r.set("Authorization", `Bearer ${token}`);
  const http = () => request(app.getHttpServer());
  const salvar = (token: string, dados: object) =>
    com(token, http().put("/v1/tema/rascunho")).send(dados);
  const publicar = (token: string) => com(token, http().post("/v1/tema/publicar"));
  const eventos = async (t: Tenant, nome: string): Promise<{ propriedades: unknown }[]> =>
    (
      await pool.query<{ propriedades: unknown }>(
        "SELECT propriedades FROM evento_analitico WHERE estabelecimento_id = $1 AND nome = $2 ORDER BY ocorrido_em",
        [t.estabelecimentoId, nome],
      )
    ).rows;
  const linhasDeTema = async (t: Tenant, estado: string): Promise<DadosDoTema[]> =>
    (
      await pool.query<{ tokens: DadosDoTema }>(
        "SELECT tokens FROM tema WHERE estabelecimento_id = $1 AND estado = $2",
        [t.estabelecimentoId, estado],
      )
    ).rows.map((l) => l.tokens);

  beforeAll(async () => {
    process.env["JWT_SEGREDO_ESTABELECIMENTO"] = SEGREDO_ESTABELECIMENTO;
    process.env["JWT_SEGREDO_PLATAFORMA"] = SEGREDO_PLATAFORMA;
    pool = criarPoolAdmin();
    a = await criarTenant(pool, "81");
    b = await criarTenant(pool, "82");
    const real = new EmissorDeTokenJose({
      audiencia: Audiencia.ConsoleEstabelecimento,
      segredo: () => SEGREDO_ESTABELECIMENTO,
      relogio: new RelogioDoSistema(),
    });
    emissor = new EmissorComClienteFinal(real);
    const modulo = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(TOKEN_EMISSOR_ESTABELECIMENTO)
      .useValue(emissor)
      .compile();
    app = modulo.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await removerTenant(pool, a.estabelecimentoId);
    await removerTenant(pool, b.estabelecimentoId);
    await pool.end();
  });

  beforeEach(async () => {
    for (const t of [a, b]) {
      await pool.query("DELETE FROM tema WHERE estabelecimento_id = $1", [t.estabelecimentoId]);
      await pool.query("DELETE FROM evento_analitico WHERE estabelecimento_id = $1", [
        t.estabelecimentoId,
      ]);
    }
  });

  describe("isolamento entre estabelecimentos", () => {
    it("o rascunho de A e invisivel a B: B recebe o padrao da vertical, nao a cor de A", async () => {
      expect((await salvar(await dono(a), corDeA.paraDados())).status).toBe(200);
      const rb = await com(await dono(b), http().get("/v1/tema/rascunho"));
      expect(rb.status).toBe(200);
      expect(rb.body.origem).toBe("padrao");
      expect(rb.body.tokens.cores.primaria).not.toBe("#0a7d4f");
      const ra = await com(await dono(a), http().get("/v1/tema/rascunho"));
      expect(ra.body.origem).toBe("rascunho");
      expect(ra.body.tokens.cores.primaria).toBe("#0a7d4f");
    });

    it("B nao publica o tema de A: sem rascunho proprio responde 404 e nada vira publicado", async () => {
      await salvar(await dono(a), corDeA.paraDados());
      const r = await publicar(await dono(b));
      expect(r.status).toBe(404);
      expect(r.body.codigo).toBe("rascunho_de_tema_nao_encontrado");
      expect(await linhasDeTema(b, "publicado")).toEqual([]);
      expect(await linhasDeTema(a, "publicado")).toEqual([]);
      expect(await eventos(b, "tema_publicado")).toEqual([]);
    });

    it("publicar em A nao altera o que o cliente de B enxerga", async () => {
      await salvar(await dono(a), corDeA.paraDados());
      expect((await publicar(await dono(a))).status).toBe(200);
      const rb = await com(await dono(b), http().get("/v1/tema"));
      expect(rb.body.origem).toBe("padrao");
      expect(rb.body.tokens.cores.primaria).not.toBe("#0a7d4f");
      const ra = await com(await dono(a), http().get("/v1/tema"));
      expect(ra.body.tokens.cores.primaria).toBe("#0a7d4f");
    });

    it("a RLS barra o repositorio mesmo quando ele pede explicitamente o id de outro tenant", async () => {
      await salvar(await dono(a), corDeA.paraDados());
      const provedor = new ProvedorDeTransacao();
      const executor = new ExecutorTransacional(pool, provedor);
      const repositorio = new TemaRepositorioPostgres(provedor);
      const idDeA = EstabelecimentoId.de(a.estabelecimentoId);
      const idDeB = EstabelecimentoId.de(b.estabelecimentoId);
      const visto = await executor.executar({ papel: "app_usuario", tenant: idDeB }, () =>
        repositorio.obterRascunho(idDeA),
      );
      expect(visto).toBeNull();
      const proprio = await executor.executar({ papel: "app_usuario", tenant: idDeA }, () =>
        repositorio.obterRascunho(idDeA),
      );
      expect(proprio?.tema.cores.obter("primaria").valor).toBe("#0a7d4f");
    });

    it("a RLS barra a escrita no tema de outro tenant", async () => {
      const provedor = new ProvedorDeTransacao();
      const executor = new ExecutorTransacional(pool, provedor);
      const repositorio = new TemaRepositorioPostgres(provedor);
      const idDeA = EstabelecimentoId.de(a.estabelecimentoId);
      const idDeB = EstabelecimentoId.de(b.estabelecimentoId);
      await expect(
        executor.executar({ papel: "app_usuario", tenant: idDeB }, () =>
          repositorio.salvarRascunho(idDeA, claro, Instante.deEpochMs(Date.now())),
        ),
      ).rejects.toThrow(/row-level security/i);
      expect(await linhasDeTema(a, "rascunho")).toEqual([]);
    });

    it("tenant informado pelo cliente que diverge do token e rejeitado com 403", async () => {
      const token = await dono(a);
      const porHeader = await salvar(token, claro.paraDados()).set(
        "x-tenant-id",
        b.estabelecimentoId,
      );
      expect(porHeader.status).toBe(403);
      expect(porHeader.body.codigo).toBe("tenant_divergente");
      const porCorpo = await com(token, http().put("/v1/tema/rascunho")).send({
        ...claro.paraDados(),
        estabelecimentoId: b.estabelecimentoId,
      });
      expect(porCorpo.status).toBe(403);
      expect(await linhasDeTema(a, "rascunho")).toEqual([]);
      expect(await linhasDeTema(b, "rascunho")).toEqual([]);
    });
  });

  describe("papeis", () => {
    it("cliente_final recebe 403 ao salvar rascunho, publicar e restaurar, e nada e gravado", async () => {
      const cliente = `${PREFIXO_CLIENTE}${a.estabelecimentoId}`;
      const salvou = await salvar(cliente, claro.paraDados());
      expect(salvou.status).toBe(403);
      expect(salvou.body.codigo).toBe("sem_permissao_para_alterar_tema");
      expect((await publicar(cliente)).status).toBe(403);
      expect((await com(cliente, http().post("/v1/tema/rascunho/restaurar-padrao"))).status).toBe(
        403,
      );
      expect(await linhasDeTema(a, "rascunho")).toEqual([]);
      expect(await eventos(a, "tema_rascunho_salvo")).toEqual([]);
    });

    it("profissional tambem recebe 403 ao salvar e ao publicar", async () => {
      const token = await tokenDe(Papel.Profissional, a);
      expect((await salvar(token, claro.paraDados())).status).toBe(403);
      expect((await publicar(token)).status).toBe(403);
    });

    it("cliente_final nunca ve o rascunho: 403 no rascunho e GET /v1/tema devolve so o publicado", async () => {
      await salvar(await dono(a), claro.paraDados());
      await publicar(await dono(a));
      await salvar(await dono(a), corDeA.paraDados());
      const cliente = `${PREFIXO_CLIENTE}${a.estabelecimentoId}`;
      expect((await com(cliente, http().get("/v1/tema/rascunho"))).status).toBe(403);
      const visto = await com(cliente, http().get("/v1/tema"));
      expect(visto.status).toBe(200);
      expect(visto.body.origem).toBe("publicado");
      expect(visto.body.tokens).toEqual(claro.paraDados());
    });

    it("gestor altera o tema; sem token a rota responde 401", async () => {
      expect((await salvar(await tokenDe(Papel.Gestor, a), claro.paraDados())).status).toBe(200);
      expect((await http().put("/v1/tema/rascunho").send(claro.paraDados())).status).toBe(401);
    });
  });

  describe("publicacao", () => {
    it("publicar copia o rascunho para o publicado e emite tema_publicado na mesma transacao", async () => {
      await salvar(await dono(a), corDeA.paraDados());
      const r = await publicar(await dono(a));
      expect(r.status).toBe(200);
      expect(r.body.versao).toBe(1);
      expect(await linhasDeTema(a, "publicado")).toEqual([corDeA.paraDados()]);
      const [evento] = await eventos(a, "tema_publicado");
      expect(evento?.propriedades).toMatchObject({ versao: 1, ator_tipo: "gestor" });
      expect(
        Number((evento?.propriedades as { contraste_minimo: number }).contraste_minimo),
      ).toBeGreaterThanOrEqual(3);
    });

    it("contraste ruim falha com 422, devolve sugestao e NAO altera o publicado nem emite evento", async () => {
      const token = await dono(a);
      await salvar(token, claro.paraDados());
      await publicar(token);
      await salvar(token, ilegivel.paraDados());
      const r = await publicar(token);
      expect(r.status).toBe(422);
      expect(r.body.codigo).toBe("contraste_insuficiente");
      expect(r.body.detalhes[0].campo).toBe("textoSuave");
      expect(r.body.detalhes[0].sugestao).toMatch(/^#[0-9a-f]{6}$/);
      expect(await linhasDeTema(a, "publicado")).toEqual([claro.paraDados()]);
      expect(await eventos(a, "tema_publicado")).toHaveLength(1);
      const visto = await com(token, http().get("/v1/tema"));
      expect(visto.body.tokens).toEqual(claro.paraDados());
      expect(visto.body.versao).toBe(1);
    });

    it("rascunho com contraste ruim e aceito; salvar nao altera o publicado", async () => {
      const token = await dono(a);
      await salvar(token, claro.paraDados());
      await publicar(token);
      const r = await salvar(token, ilegivel.paraDados());
      expect(r.status).toBe(200);
      expect(await linhasDeTema(a, "publicado")).toEqual([claro.paraDados()]);
    });

    it("as versoes de rascunho e publicado crescem e sao lidas de volta", async () => {
      const token = await dono(a);
      expect((await salvar(token, claro.paraDados())).body.versao).toBe(1);
      expect((await salvar(token, corDeA.paraDados())).body.versao).toBe(2);
      expect((await com(token, http().get("/v1/tema/rascunho"))).body.versao).toBe(2);
      expect((await publicar(token)).body.versao).toBe(1);
      expect((await publicar(token)).body.versao).toBe(2);
      expect((await com(token, http().get("/v1/tema"))).body.versao).toBe(2);
    });

    it("restaurar o padrao troca so o rascunho e emite tema_rascunho_salvo", async () => {
      const token = await dono(a);
      await salvar(token, corDeA.paraDados());
      await publicar(token);
      const r = await com(token, http().post("/v1/tema/rascunho/restaurar-padrao"));
      expect(r.status).toBe(200);
      expect(r.body.tokens).toEqual(temaPadraoDaVertical("barbearia").paraDados());
      expect(await linhasDeTema(a, "publicado")).toEqual([corDeA.paraDados()]);
      expect(await eventos(a, "tema_rascunho_salvo")).toHaveLength(2);
    });

    it("eventos pertencem ao tenant do autor, com ids e sem dado pessoal", async () => {
      await salvar(await dono(a), corDeA.paraDados());
      expect(await eventos(b, "tema_rascunho_salvo")).toEqual([]);
      const [evento] = await eventos(a, "tema_rascunho_salvo");
      expect(Object.keys(evento?.propriedades as object).sort()).toEqual(
        ["ator_id", "ator_tipo", "campos_alterados", "versao"].sort(),
      );
      expect(JSON.stringify(evento)).not.toContain("@");
    });
  });

  describe("entrada e opcoes", () => {
    it("tema fora das opcoes curadas responde 400 com o campo e nada e gravado", async () => {
      const r = await salvar(await dono(a), { ...claro.paraDados(), raio: "gigante" });
      expect(r.status).toBe(400);
      expect(r.body.codigo).toBe("tema_invalido");
      expect(r.body.detalhes[0].campo).toBe("raio");
      expect(await linhasDeTema(a, "rascunho")).toEqual([]);
    });

    it("GET /v1/tema/opcoes lista as opcoes curadas", async () => {
      const r = await com(await dono(a), http().get("/v1/tema/opcoes"));
      expect(r.status).toBe(200);
      expect(r.body.familias.length).toBeGreaterThanOrEqual(4);
      expect(r.body.contrasteMinimo).toEqual({ textoNormal: 4.5, componente: 3 });
    });
  });
});
