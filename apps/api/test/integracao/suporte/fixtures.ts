import type pg from "pg";

export interface Tenant {
  readonly estabelecimentoId: string;
  readonly usuarioId: string;
  readonly servicoId: string;
  readonly profissionalId: string;
  readonly clienteId: string;
  readonly agendamentoId: string;
}

/** Cria, como administrador, um estabelecimento completo com um agendamento. */
export async function criarTenant(pool: pg.Pool, sufixo: string): Promise<Tenant> {
  const um = async (sql: string, args: unknown[]): Promise<string> => {
    const r = await pool.query<{ id: string }>(sql, args);
    const linha = r.rows[0];
    if (!linha) throw new Error("fixture nao retornou id");
    return linha.id;
  };
  const estabelecimentoId = await um(
    `INSERT INTO estabelecimento (vertical_id, slug, nome)
     VALUES ((SELECT id FROM vertical WHERE slug = 'barbearia'), $1, $2) RETURNING id`,
    [`teste-${sufixo}`, `Teste ${sufixo}`],
  );
  const usuarioId = await um(
    `INSERT INTO usuario (estabelecimento_id, email, nome, papel, senha_hash)
     VALUES ($1, $2, 'Dono', 'dono', 'hash-de-teste') RETURNING id`,
    [estabelecimentoId, `dono-${sufixo}@exemplo.test`],
  );
  const servicoId = await um(
    `INSERT INTO servico (estabelecimento_id, nome, duracao_minutos, preco_centavos)
     VALUES ($1, 'Corte', 30, 4500) RETURNING id`,
    [estabelecimentoId],
  );
  const profissionalId = await um(
    `INSERT INTO profissional (estabelecimento_id, usuario_id, nome) VALUES ($1, $2, 'Joao') RETURNING id`,
    [estabelecimentoId, usuarioId],
  );
  const clienteId = await um(
    `INSERT INTO cliente_final (estabelecimento_id, telefone) VALUES ($1, $2) RETURNING id`,
    [estabelecimentoId, `+5511900${sufixo.padStart(6, "0").slice(-6)}`],
  );
  const agendamentoId = await um(
    `INSERT INTO agendamento (estabelecimento_id, profissional_id, servico_id, cliente_id, inicio, fim)
     VALUES ($1, $2, $3, $4, '2030-01-10T13:00:00Z', '2030-01-10T13:30:00Z') RETURNING id`,
    [estabelecimentoId, profissionalId, servicoId, clienteId],
  );
  return { estabelecimentoId, usuarioId, servicoId, profissionalId, clienteId, agendamentoId };
}

export async function removerTenant(pool: pg.Pool, estabelecimentoId: string): Promise<void> {
  for (const tabela of [
    "evento_analitico",
    "tema",
    "agendamento",
    "cliente_final",
    "profissional",
    "servico",
    "usuario",
  ]) {
    await pool.query(`DELETE FROM ${tabela} WHERE estabelecimento_id = $1`, [estabelecimentoId]);
  }
  await pool.query("DELETE FROM estabelecimento WHERE id = $1", [estabelecimentoId]);
}
