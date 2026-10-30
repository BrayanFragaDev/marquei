import { Controller, Get, Module, type INestApplication } from "@nestjs/common";
import { Test } from "@nestjs/testing";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { AppModule } from "../../src/app.module";
import { Publica } from "../../src/seguranca/decoradores/publica";
import { SEGREDO_ESTABELECIMENTO, SEGREDO_PLATAFORMA } from "../identidade/suporte";
import { auditarRotas } from "./varredura";

/** Unica lista de rotas abertas ao mundo. Acrescentar aqui e uma decisao consciente de revisao. */
const ROTAS_PUBLICAS_PERMITIDAS = [
  "GET /v1/saude",
  "POST /v1/auth/login",
  "GET /v1/estabelecimentos/:slug",
];

describe("varredura de rotas (F0-23)", () => {
  let app: INestApplication;

  beforeAll(async () => {
    process.env["JWT_SEGREDO_ESTABELECIMENTO"] = SEGREDO_ESTABELECIMENTO;
    process.env["JWT_SEGREDO_PLATAFORMA"] = SEGREDO_PLATAFORMA;
    const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modulo.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("toda rota registrada e publica explicita ou recusa requisicao sem credencial", async () => {
    const auditoria = await auditarRotas(app);
    expect(auditoria.desprotegidas).toEqual([]);
  });

  it("as rotas publicas sao exatamente as permitidas", async () => {
    const auditoria = await auditarRotas(app);
    expect([...auditoria.publicas].sort()).toEqual([...ROTAS_PUBLICAS_PERMITIDAS].sort());
  });

  it("a varredura falha quando existe rota sem guard (prova do detector)", async () => {
    @Controller("aberta")
    class ControladorSemGuard {
      @Get()
      ler(): { ok: true } {
        return { ok: true };
      }

      @Publica()
      @Get("publica")
      lerPublica(): { ok: true } {
        return { ok: true };
      }
    }
    @Module({ controllers: [ControladorSemGuard] })
    class ModuloSemGuard {}

    const modulo = await Test.createTestingModule({ imports: [ModuloSemGuard] }).compile();
    const semGuard = modulo.createNestApplication();
    await semGuard.init();
    const auditoria = await auditarRotas(semGuard);
    await semGuard.close();
    expect(auditoria.desprotegidas).toEqual(["GET /aberta"]);
    expect(auditoria.publicas).toEqual(["GET /aberta/publica"]);
  });
});
