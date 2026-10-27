import { describe, expect, it } from "vitest";
import { carregarEnv, EnvInvalidoError } from "../src/env";

const valido = {
  DATABASE_URL: "postgres://usuario:senha@localhost:5432/marquei",
  REDIS_URL: "redis://localhost:6379",
};

describe("carregarEnv", () => {
  it("retorna o env tipado e aplica os valores padrao", () => {
    const env = carregarEnv(valido);
    expect(env.NODE_ENV).toBe("development");
    expect(env.API_PORT).toBe(3000);
    expect(env.REDIS_URL).toBe("redis://localhost:6379");
  });

  it("converte a porta para numero", () => {
    expect(carregarEnv({ ...valido, API_PORT: "8080" }).API_PORT).toBe(8080);
  });

  it("falha listando cada variavel ausente", () => {
    expect.assertions(3);
    try {
      carregarEnv({});
    } catch (erro) {
      expect(erro).toBeInstanceOf(EnvInvalidoError);
      expect((erro as Error).message).toContain("DATABASE_URL");
      expect((erro as Error).message).toContain("REDIS_URL");
    }
  });

  it("nunca vaza o valor invalido na mensagem de erro", () => {
    expect.assertions(1);
    try {
      carregarEnv({ ...valido, DATABASE_URL: "segredo-que-nao-e-url" });
    } catch (erro) {
      expect((erro as Error).message).not.toContain("segredo-que-nao-e-url");
    }
  });
});
