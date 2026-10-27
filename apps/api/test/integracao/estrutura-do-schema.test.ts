import type pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { criarPoolAdmin } from "./suporte/banco";
import { criarTenant, removerTenant, type Tenant } from "./suporte/fixtures";

describe("estrutura do schema", () => {
  let pool: pg.Pool;
  let a: Tenant;

  beforeAll(async () => {
    pool = criarPoolAdmin();
    a = await criarTenant(pool, "44");
  });

  afterAll(async () => {
    await removerTenant(pool, a.estabelecimentoId);
    await pool.end();
  });

  it("toda tabela com estabelecimento_id tem RLS habilitada e forcada", async () => {
    const r = await pool.query<{ relname: string }>(`
      SELECT c.relname FROM pg_class c
      WHERE c.relkind = 'r' AND c.relnamespace = 'public'::regnamespace
        AND EXISTS (SELECT 1 FROM pg_attribute a WHERE a.attrelid = c.oid AND a.attname = 'estabelecimento_id')
        AND NOT (c.relrowsecurity AND c.relforcerowsecurity)`);
    expect(r.rows).toEqual([]);
  });

  it("estabelecimento_id e NOT NULL em toda tabela de tenant", async () => {
    const r = await pool.query<{ table_name: string }>(`
      SELECT table_name FROM information_schema.columns
      WHERE table_schema = 'public' AND column_name = 'estabelecimento_id' AND is_nullable = 'YES'`);
    expect(r.rows).toEqual([]);
  });

  it("nenhum papel da aplicacao tem BYPASSRLS nem e superusuario", async () => {
    const r = await pool.query<{ rolname: string }>(`
      SELECT rolname FROM pg_roles
      WHERE rolname IN ('app_usuario', 'app_plataforma', 'migrador') AND (rolbypassrls OR rolsuper)`);
    expect(r.rows).toEqual([]);
  });

  it("existem as cinco verticais de referencia", async () => {
    const r = await pool.query<{ total: string }>("SELECT count(*) AS total FROM vertical");
    expect(r.rows[0]).toEqual({ total: "5" });
  });

  it("recusa agendamento sobreposto do mesmo profissional", async () => {
    await expect(
      pool.query(
        `INSERT INTO agendamento (estabelecimento_id, profissional_id, servico_id, cliente_id, inicio, fim)
         VALUES ($1, $2, $3, $4, '2030-01-10T13:15:00Z', '2030-01-10T13:45:00Z')`,
        [a.estabelecimentoId, a.profissionalId, a.servicoId, a.clienteId],
      ),
    ).rejects.toThrow(/agendamento_sem_sobreposicao/);
  });

  it("aceita horarios consecutivos (fim de um e inicio do outro coincidem)", async () => {
    const r = await pool.query(
      `INSERT INTO agendamento (estabelecimento_id, profissional_id, servico_id, cliente_id, inicio, fim)
       VALUES ($1, $2, $3, $4, '2030-01-10T13:30:00Z', '2030-01-10T14:00:00Z')`,
      [a.estabelecimentoId, a.profissionalId, a.servicoId, a.clienteId],
    );
    expect(r.rowCount).toBe(1);
  });

  it("libera o horario quando o agendamento e cancelado", async () => {
    await pool.query("UPDATE agendamento SET status = 'cancelado' WHERE id = $1", [
      a.agendamentoId,
    ]);
    const r = await pool.query(
      `INSERT INTO agendamento (estabelecimento_id, profissional_id, servico_id, cliente_id, inicio, fim)
       VALUES ($1, $2, $3, $4, '2030-01-10T13:00:00Z', '2030-01-10T13:30:00Z')`,
      [a.estabelecimentoId, a.profissionalId, a.servicoId, a.clienteId],
    );
    expect(r.rowCount).toBe(1);
  });
});
