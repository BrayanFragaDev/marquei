import type pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { comPapel, criarPoolAdmin } from "./suporte/banco";
import { criarTenant, removerTenant, type Tenant } from "./suporte/fixtures";

const TABELAS_DE_TENANT = [
  "usuario",
  "servico",
  "profissional",
  "cliente_final",
  "agendamento",
] as const;

describe("isolamento entre estabelecimentos (RLS)", () => {
  let pool: pg.Pool;
  let a: Tenant;
  let b: Tenant;

  beforeAll(async () => {
    pool = criarPoolAdmin();
    a = await criarTenant(pool, "11");
    b = await criarTenant(pool, "22");
  });

  afterAll(async () => {
    await removerTenant(pool, a.estabelecimentoId);
    await removerTenant(pool, b.estabelecimentoId);
    await pool.end();
  });

  it.each(TABELAS_DE_TENANT)(
    "tenant A nao le nem lista linhas de %s do tenant B",
    async (tabela) => {
      const r = await comPapel(pool, { papel: "app_usuario", tenant: a.estabelecimentoId }, (c) =>
        c.query<{ estabelecimento_id: string }>(`SELECT estabelecimento_id FROM ${tabela}`),
      );
      expect(r.rowCount).toBe(1);
      expect(r.rows.every((l) => l.estabelecimento_id === a.estabelecimentoId)).toBe(true);
    },
  );

  it("tenant A nao enxerga o estabelecimento B", async () => {
    const r = await comPapel(pool, { papel: "app_usuario", tenant: a.estabelecimentoId }, (c) =>
      c.query("SELECT id FROM estabelecimento WHERE id = $1", [b.estabelecimentoId]),
    );
    expect(r.rowCount).toBe(0);
  });

  it("tenant A nao altera o agendamento do tenant B", async () => {
    const r = await comPapel(pool, { papel: "app_usuario", tenant: a.estabelecimentoId }, (c) =>
      c.query("UPDATE agendamento SET status = 'cancelado' WHERE id = $1", [b.agendamentoId]),
    );
    expect(r.rowCount).toBe(0);
    const intacto = await pool.query("SELECT status FROM agendamento WHERE id = $1", [
      b.agendamentoId,
    ]);
    expect(intacto.rows[0]).toEqual({ status: "confirmado" });
  });

  it("tenant A nao apaga linhas do tenant B", async () => {
    const r = await comPapel(pool, { papel: "app_usuario", tenant: a.estabelecimentoId }, (c) =>
      c.query("DELETE FROM servico WHERE id = $1", [b.servicoId]),
    );
    expect(r.rowCount).toBe(0);
  });

  it("tenant A nao grava dado em nome do tenant B", async () => {
    await expect(
      comPapel(pool, { papel: "app_usuario", tenant: a.estabelecimentoId }, (c) =>
        c.query(
          "INSERT INTO servico (estabelecimento_id, nome, duracao_minutos, preco_centavos) VALUES ($1, 'Intruso', 10, 100)",
          [b.estabelecimentoId],
        ),
      ),
    ).rejects.toThrow(/row-level security/i);
  });

  it("tenant A nao move uma linha sua para o tenant B", async () => {
    await expect(
      comPapel(pool, { papel: "app_usuario", tenant: a.estabelecimentoId }, (c) =>
        c.query("UPDATE servico SET estabelecimento_id = $1 WHERE id = $2", [
          b.estabelecimentoId,
          a.servicoId,
        ]),
      ),
    ).rejects.toThrow(/row-level security/i);
  });

  it("agendamento nao referencia profissional de outro estabelecimento", async () => {
    await expect(
      pool.query(
        `INSERT INTO agendamento (estabelecimento_id, profissional_id, servico_id, cliente_id, inicio, fim)
         VALUES ($1, $2, $3, $4, '2030-02-01T10:00:00Z', '2030-02-01T10:30:00Z')`,
        [a.estabelecimentoId, b.profissionalId, a.servicoId, a.clienteId],
      ),
    ).rejects.toThrow(/foreign key/i);
  });

  it("operador da plataforma enxerga os dois estabelecimentos", async () => {
    const r = await comPapel(pool, { papel: "app_plataforma" }, (c) =>
      c.query("SELECT id FROM estabelecimento WHERE id = ANY($1)", [
        [a.estabelecimentoId, b.estabelecimentoId],
      ]),
    );
    expect(r.rowCount).toBe(2);
  });

  it("aplicacao nao altera nem apaga eventos analiticos (outbox so acrescenta)", async () => {
    await expect(
      comPapel(pool, { papel: "app_usuario", tenant: a.estabelecimentoId }, (c) =>
        c.query("DELETE FROM evento_analitico"),
      ),
    ).rejects.toThrow(/permission denied/i);
  });
});
