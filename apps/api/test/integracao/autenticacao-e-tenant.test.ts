import type { INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import argon2 from "argon2";
import type pg from "pg";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  Email,
  EstabelecimentoId,
  Instante,
  Papel,
  Sessao,
  UsuarioId,
  type EmissorDeToken,
} from "@marquei/dominio";
import { AppModule } from "../../src/app.module";
import { TOKEN_EMISSOR_PLATAFORMA } from "../../src/seguranca/tokens/tokens-de-injecao";
import { SEGREDO_ESTABELECIMENTO, SEGREDO_PLATAFORMA } from "../identidade/suporte";
import { criarPoolAdmin } from "./suporte/banco";
import { criarTenant, removerTenant, type Tenant } from "./suporte/fixtures";
import { RotasDeTesteModule } from "./suporte/rotas-de-teste";

const SENHA_A = "cavalo-bateria-grampo-7";
const SENHA_B = "lanterna-vulcao-pente-4";

describe("autenticacao e tenant (F0-21, F0-22, F0-24)", () => {
  let app: INestApplication;
  let pool: pg.Pool;
  let a: Tenant;
  let b: Tenant;
  let emissorPlataforma: EmissorDeToken;
  const linhasDeLog: string[] = [];

  const login = (slug: string, email: string, senha: string) =>
    request(app.getHttpServer())
      .post("/v1/auth/login")
      .send({ estabelecimento: slug, email, senha });
  const tokenDe = async (slug: string, email: string, senha: string): Promise<string> =>
    (await login(slug, email, senha)).body.token as string;

  beforeAll(async () => {
    process.env["JWT_SEGREDO_ESTABELECIMENTO"] = SEGREDO_ESTABELECIMENTO;
    process.env["JWT_SEGREDO_PLATAFORMA"] = SEGREDO_PLATAFORMA;
    pool = criarPoolAdmin();
    a = await criarTenant(pool, "71");
    b = await criarTenant(pool, "72");
    await pool.query("UPDATE usuario SET senha_hash = $1 WHERE id = $2", [
      await argon2.hash(SENHA_A),
      a.usuarioId,
    ]);
    await pool.query("UPDATE usuario SET senha_hash = $1 WHERE id = $2", [
      await argon2.hash(SENHA_B),
      b.usuarioId,
    ]);
    const modulo = await Test.createTestingModule({
      imports: [AppModule, RotasDeTesteModule],
    }).compile();
    app = modulo.createNestApplication({
      logger: {
        log: (m: unknown) => linhasDeLog.push(String(m)),
        error: (m: unknown) => linhasDeLog.push(String(m)),
        warn: (m: unknown) => linhasDeLog.push(String(m)),
      },
    });
    await app.init();
    emissorPlataforma = app.get<EmissorDeToken>(TOKEN_EMISSOR_PLATAFORMA);
  });

  afterAll(async () => {
    await app.close();
    await removerTenant(pool, a.estabelecimentoId);
    await removerTenant(pool, b.estabelecimentoId);
    await pool.end();
  });

  describe("login por e-mail e senha", () => {
    it("credenciais validas devolvem token com papel e tenant do servidor", async () => {
      const r = await login("teste-71", "dono-71@exemplo.test", SENHA_A);
      expect(r.status).toBe(200);
      expect(r.body.papel).toBe("dono");
      expect(r.body.estabelecimentoId).toBe(a.estabelecimentoId);
      expect(Object.keys(r.body).sort()).toEqual(
        ["estabelecimentoId", "expiraEm", "papel", "token", "usuarioId"].sort(),
      );
    });

    it("tenant enviado pelo cliente no corpo do login e ignorado", async () => {
      const r = await request(app.getHttpServer()).post("/v1/auth/login").send({
        estabelecimento: "teste-71",
        estabelecimentoId: b.estabelecimentoId,
        email: "dono-71@exemplo.test",
        senha: SENHA_A,
      });
      expect(r.body.estabelecimentoId).toBe(a.estabelecimentoId);
    });

    it("senha errada, e-mail inexistente e slug inexistente respondem 401 identico", async () => {
      const respostas = await Promise.all([
        login("teste-71", "dono-71@exemplo.test", "senha-errada-qualquer"),
        login("teste-71", "fantasma@exemplo.test", SENHA_A),
        login("nao-existe-mesmo", "dono-71@exemplo.test", SENHA_A),
      ]);
      for (const r of respostas) expect(r.status).toBe(401);
      expect(respostas[1]?.body).toEqual(respostas[0]?.body);
      expect(respostas[2]?.body).toEqual(respostas[0]?.body);
      expect(respostas[0]?.body.codigo).toBe("credenciais_invalidas");
    });

    it("usuario de um estabelecimento nao entra no outro", async () => {
      expect((await login("teste-72", "dono-71@exemplo.test", SENHA_A)).status).toBe(401);
    });

    it("o mesmo e-mail em dois estabelecimentos autentica cada um com a sua senha", async () => {
      await pool.query(
        `INSERT INTO usuario (estabelecimento_id, email, nome, papel, senha_hash)
         VALUES ($1, 'comum@exemplo.test', 'Comum A', 'gestor', $3), ($2, 'comum@exemplo.test', 'Comum B', 'gestor', $4)`,
        [
          a.estabelecimentoId,
          b.estabelecimentoId,
          await argon2.hash(SENHA_A),
          await argon2.hash(SENHA_B),
        ],
      );
      const ra = await login("teste-71", "comum@exemplo.test", SENHA_A);
      const rb = await login("teste-72", "comum@exemplo.test", SENHA_B);
      expect(ra.body.estabelecimentoId).toBe(a.estabelecimentoId);
      expect(rb.body.estabelecimentoId).toBe(b.estabelecimentoId);
      expect((await login("teste-71", "comum@exemplo.test", SENHA_B)).status).toBe(401);
    });

    it("estabelecimento suspenso nao permite login", async () => {
      await pool.query("UPDATE estabelecimento SET status = 'suspenso' WHERE id = $1", [
        b.estabelecimentoId,
      ]);
      try {
        expect((await login("teste-72", "dono-72@exemplo.test", SENHA_B)).status).toBe(401);
      } finally {
        await pool.query("UPDATE estabelecimento SET status = 'ativo' WHERE id = $1", [
          b.estabelecimentoId,
        ]);
      }
    });

    it("cinco falhas bloqueiam com 429, mesmo com a senha certa", async () => {
      for (let i = 0; i < 5; i++) await login("teste-71", "alvo-do-abuso@exemplo.test", "errada");
      const r = await login("teste-71", "alvo-do-abuso@exemplo.test", "errada");
      expect(r.status).toBe(429);
      expect(r.body.codigo).toBe("conta_bloqueada_por_tentativas");
    });

    it("corpo malformado responde 400 sem tocar no banco", async () => {
      const r = await request(app.getHttpServer()).post("/v1/auth/login").send({ email: 1 });
      expect(r.status).toBe(400);
    });

    it("a senha nunca aparece em log", () => {
      const tudo = linhasDeLog.join("\n");
      for (const segredo of [SENHA_A, SENHA_B, "senha-errada-qualquer"]) {
        expect(tudo).not.toContain(segredo);
      }
    });
  });

  describe("interceptor de tenant: a rota le somente o tenant da sessao", () => {
    it("cada token enxerga apenas os dados do proprio estabelecimento (RLS pela sessao)", async () => {
      const tokenA = await tokenDe("teste-71", "dono-71@exemplo.test", SENHA_A);
      const tokenB = await tokenDe("teste-72", "dono-72@exemplo.test", SENHA_B);
      const ra = await request(app.getHttpServer())
        .get("/teste/servicos")
        .set("Authorization", `Bearer ${tokenA}`);
      const rb = await request(app.getHttpServer())
        .get("/teste/servicos")
        .set("Authorization", `Bearer ${tokenB}`);
      expect(ra.body.ids).toEqual([a.servicoId]);
      expect(rb.body.ids).toEqual([b.servicoId]);
    });

    it("sem token ou com token lixo responde 401", async () => {
      expect((await request(app.getHttpServer()).get("/teste/servicos")).status).toBe(401);
      const r = await request(app.getHttpServer())
        .get("/teste/servicos")
        .set("Authorization", "Bearer lixo");
      expect(r.status).toBe(401);
      expect(r.body.codigo).toBe("sessao_invalida");
    });

    describe("tenant divergente vindo do cliente e rejeitado com 403", () => {
      let tokenA: string;
      beforeAll(async () => {
        tokenA = await tokenDe("teste-71", "dono-71@exemplo.test", SENHA_A);
      });
      const com = (r: request.Test) => r.set("Authorization", `Bearer ${tokenA}`);

      it.each(["x-tenant-id", "x-estabelecimento-id"])("header %s", async (header) => {
        const r = await com(request(app.getHttpServer()).get("/teste/servicos")).set(
          header,
          b.estabelecimentoId,
        );
        expect(r.status).toBe(403);
        expect(r.body.codigo).toBe("tenant_divergente");
      });

      it("query", async () => {
        const r = await com(
          request(app.getHttpServer()).get(
            `/teste/servicos?estabelecimentoId=${b.estabelecimentoId}`,
          ),
        );
        expect(r.status).toBe(403);
      });

      it.each(["estabelecimentoId", "estabelecimento_id", "tenantId", "tenant"])(
        "corpo (%s)",
        async (campo) => {
          const r = await com(request(app.getHttpServer()).post("/teste/eco")).send({
            [campo]: b.estabelecimentoId,
          });
          expect(r.status).toBe(403);
        },
      );

      it("parametro de rota", async () => {
        const r = await com(
          request(app.getHttpServer()).get(`/teste/estabelecimento/${b.estabelecimentoId}/ping`),
        );
        expect(r.status).toBe(403);
      });

      it("valor que nao e texto tambem diverge", async () => {
        const r = await com(request(app.getHttpServer()).post("/teste/eco")).send({
          tenantId: { $ne: null },
        });
        expect(r.status).toBe(403);
      });

      it("o mesmo tenant da sessao e aceito (e continua lendo so o da sessao)", async () => {
        const r = await com(request(app.getHttpServer()).get("/teste/servicos")).set(
          "x-tenant-id",
          a.estabelecimentoId,
        );
        expect(r.status).toBe(200);
        expect(r.body.ids).toEqual([a.servicoId]);
      });
    });

    it("token forjado para outro tenant com segredo errado e recusado", async () => {
      const { SignJWT } = await import("jose");
      const forjado = await new SignJWT({ papel: "dono", tenant: b.estabelecimentoId })
        .setProtectedHeader({ alg: "HS256" })
        .setSubject(b.usuarioId)
        .setAudience("console-estabelecimento")
        .setIssuer("marquei-api")
        .setIssuedAt()
        .setExpirationTime("10m")
        .sign(new TextEncoder().encode("um-segredo-adivinhado-qualquer-com-32-chars"));
      const r = await request(app.getHttpServer())
        .get("/teste/servicos")
        .set("Authorization", `Bearer ${forjado}`);
      expect(r.status).toBe(401);
    });
  });

  describe("emissor do operador e separacao de audiencias (F0-24)", () => {
    const operador = (): Promise<string> =>
      emissorPlataforma
        .emitir(
          Sessao.criar({
            usuarioId: UsuarioId.de("00000000-0000-4000-8000-0000000000f1"),
            papel: Papel.OperadorPlataforma,
            tenant: null,
            emitidaEm: Instante.deEpochMs(Date.now()),
            validadeEmMinutos: 15,
          }),
        )
        .then((t) => t.token);

    it("token do estabelecimento e recusado na rota do operador", async () => {
      const token = await tokenDe("teste-71", "dono-71@exemplo.test", SENHA_A);
      const r = await request(app.getHttpServer())
        .get("/teste/operador/estabelecimentos")
        .set("Authorization", `Bearer ${token}`);
      expect(r.status).toBe(401);
    });

    it("token do operador e recusado em rota do estabelecimento", async () => {
      const r = await request(app.getHttpServer())
        .get("/teste/servicos")
        .set("Authorization", `Bearer ${await operador()}`);
      expect(r.status).toBe(401);
    });

    it("token do operador acessa a rota do operador e ve todos os estabelecimentos", async () => {
      const r = await request(app.getHttpServer())
        .get("/teste/operador/estabelecimentos")
        .set("Authorization", `Bearer ${await operador()}`);
      expect(r.status).toBe(200);
      expect(r.body.total).toBeGreaterThanOrEqual(2);
    });

    it("rota do operador sem token responde 401", async () => {
      expect(
        (await request(app.getHttpServer()).get("/teste/operador/estabelecimentos")).status,
      ).toBe(401);
    });
  });

  it("referencias de tipos usadas pelo teste existem", () => {
    expect(Email.de("a@b.co").valor).toBe("a@b.co");
    expect(EstabelecimentoId.de(a.estabelecimentoId).valor).toBe(a.estabelecimentoId);
  });
});
