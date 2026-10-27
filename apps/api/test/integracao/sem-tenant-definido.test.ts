import type pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { comPapel, criarPoolAdmin } from "./suporte/banco";
import { criarTenant, removerTenant, type Tenant } from "./suporte/fixtures";

describe("consulta sem tenant definido", () => {
  let pool: pg.Pool;
  let a: Tenant;

  beforeAll(async () => {
    pool = criarPoolAdmin();
    a = await criarTenant(pool, "33");
  });

  afterAll(async () => {
    await removerTenant(pool, a.estabelecimentoId);
    await pool.end();
  });

  it.each(["agendamento", "servico", "usuario", "estabelecimento", "tema", "evento_analitico"])(
    "%s retorna zero linhas quando o tenant nao foi definido",
    async (tabela) => {
      const r = await comPapel(pool, { papel: "app_usuario" }, (c) =>
        c.query(`SELECT 1 FROM ${tabela}`),
      );
      expect(r.rowCount).toBe(0);
    },
  );

  it("tenant vazio tambem retorna zero linhas", async () => {
    const r = await comPapel(pool, { papel: "app_usuario", tenant: "" }, (c) =>
      c.query("SELECT 1 FROM agendamento"),
    );
    expect(r.rowCount).toBe(0);
  });

  it("nao permite inserir sem tenant definido", async () => {
    await expect(
      comPapel(pool, { papel: "app_usuario" }, (c) =>
        c.query(
          "INSERT INTO servico (estabelecimento_id, nome, duracao_minutos, preco_centavos) VALUES ($1, 'X', 10, 100)",
          [a.estabelecimentoId],
        ),
      ),
    ).rejects.toThrow(/row-level security/i);
  });
});
