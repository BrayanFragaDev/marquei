import type { Pool, PoolClient } from "pg";
import type { ConexaoDeBanco, ResultadoDeConsulta } from "./conexao-de-banco";
import type { ContextoDeAcesso } from "./contexto-de-acesso";
import type { ProvedorDeTransacao } from "./provedor-de-transacao";

class ConexaoPg implements ConexaoDeBanco {
  constructor(private readonly cliente: PoolClient) {}

  async consultar<L extends object>(
    sql: string,
    parametros: readonly unknown[] = [],
  ): Promise<ResultadoDeConsulta<L>> {
    const r = await this.cliente.query<L>(sql, [...parametros]);
    return { linhas: r.rows, quantidade: r.rowCount ?? 0 };
  }
}

/**
 * Abre a transacao, assume o papel do banco e fixa o tenant com `SET LOCAL` (via set_config
 * local), deixando a conexao disponivel ao `ProvedorDeTransacao`. Commit se a acao termina,
 * rollback se lanca. O tenant vem sempre do token autenticado, nunca do cliente.
 */
export class ExecutorTransacional {
  constructor(
    private readonly pool: Pool,
    private readonly provedor: ProvedorDeTransacao,
  ) {}

  async executar<T>(contexto: ContextoDeAcesso, acao: () => Promise<T>): Promise<T> {
    const cliente = await this.pool.connect();
    try {
      await cliente.query("BEGIN");
      await cliente.query(`SET LOCAL ROLE ${contexto.papel}`);
      if (contexto.papel === "app_usuario") {
        await cliente.query("SELECT set_config('app.estabelecimento_id', $1, true)", [
          contexto.tenant.valor,
        ]);
      }
      const resultado = await this.provedor.dentroDe(new ConexaoPg(cliente), acao);
      await cliente.query("COMMIT");
      return resultado;
    } catch (erro) {
      await cliente.query("ROLLBACK");
      throw erro;
    } finally {
      cliente.release();
    }
  }
}
