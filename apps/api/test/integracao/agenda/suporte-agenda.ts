import type pg from "pg";
import type { Tenant } from "../suporte/fixtures";

/** Terca-feira, 2030-01-15. Em janeiro de 2030 Sao Paulo esta em UTC-3: 09:00 local = 12:00Z. */
export const TERCA = "2030-01-15";
export const NOVE_HORAS_UTC = "2030-01-15T12:00:00.000Z";

export const iso = (hora: number, minuto = 0): string =>
  `2030-01-15T${String(hora).padStart(2, "0")}:${String(minuto).padStart(2, "0")}:00.000Z`;

/** Habilita o profissional no servico, define terca 09:00-12:00 e 10 min de intervalo no servico. */
export async function prepararAgenda(pool: pg.Pool, tenant: Tenant): Promise<void> {
  await pool.query(
    `INSERT INTO profissional_servico (estabelecimento_id, profissional_id, servico_id)
     VALUES ($1, $2, $3)`,
    [tenant.estabelecimentoId, tenant.profissionalId, tenant.servicoId],
  );
  await pool.query(
    `INSERT INTO horario_trabalho (estabelecimento_id, profissional_id, dia_da_semana, inicio_minutos, fim_minutos)
     VALUES ($1, $2, 2, 540, 720)`,
    [tenant.estabelecimentoId, tenant.profissionalId],
  );
  await pool.query("UPDATE servico SET intervalo_apos_minutos = 10 WHERE id = $1", [
    tenant.servicoId,
  ]);
}

/** Apaga o que a agenda criou, na ordem das chaves estrangeiras (antes de `removerTenant`). */
export async function limparAgenda(pool: pg.Pool, estabelecimentoId: string): Promise<void> {
  for (const tabela of ["bloqueio", "horario_trabalho", "profissional_servico"]) {
    await pool.query(`DELETE FROM ${tabela} WHERE estabelecimento_id = $1`, [estabelecimentoId]);
  }
}
