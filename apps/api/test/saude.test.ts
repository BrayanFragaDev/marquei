import { Test } from "@nestjs/testing";
import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { INestApplication } from "@nestjs/common";
import { AppModule } from "../src/app.module";

describe("GET /v1/saude", () => {
  let app: INestApplication;

  beforeAll(async () => {
    const modulo = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = modulo.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it("responde ok sem autenticacao", async () => {
    const resposta = await request(app.getHttpServer()).get("/v1/saude");
    expect(resposta.status).toBe(200);
    expect(resposta.body).toEqual({ status: "ok" });
  });
});
