import pg from "pg";

export type PapelDoBanco = "app_usuario" | "app_plataforma";

const URL_PADRAO = "postgres://postgres:postgres@localhost:5432/marquei";

/** Conexao administrativa (superusuario): so para montar e limpar fixtures. */
export function criarPoolAdmin(): pg.Pool {
  return new pg.Pool({ connectionString: process.env["DATABASE_URL"] ?? URL_PADRAO, max: 4 });
}

/**
 * Executa `acao` numa transacao com o papel da aplicacao e o tenant definidos por
 * `SET LOCAL` (CLAUDE.md, secao 5). Sempre faz rollback: nada vaza entre testes.
 * Sem `tenant`, simula uma requisicao que esqueceu de definir o estabelecimento.
 */
export async function comPapel<T>(
  pool: pg.Pool,
  opcoes: { papel: PapelDoBanco; tenant?: string },
  acao: (cliente: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const cliente = await pool.connect();
  try {
    await cliente.query("BEGIN");
    await cliente.query(`SET LOCAL ROLE ${opcoes.papel}`);
    if (opcoes.tenant !== undefined) {
      await cliente.query("SELECT set_config('app.estabelecimento_id', $1, true)", [opcoes.tenant]);
    }
    return await acao(cliente);
  } finally {
    await cliente.query("ROLLBACK");
    cliente.release();
  }
}
