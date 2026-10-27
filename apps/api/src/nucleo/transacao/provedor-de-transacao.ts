import { AsyncLocalStorage } from "node:async_hooks";
import type { ConexaoDeBanco } from "./conexao-de-banco";
import { SemTransacaoComTenantError } from "./sem-transacao-com-tenant-error";

/**
 * Guarda a conexao da transacao corrente. Repositorios chamam `atual()`; fora de uma
 * transacao aberta pelo `ExecutorTransacional` isso falha (F0-18), entao e impossivel
 * consultar o banco sem tenant definido por engano.
 */
export class ProvedorDeTransacao {
  private readonly armazenamento = new AsyncLocalStorage<ConexaoDeBanco>();

  atual(): ConexaoDeBanco {
    const conexao = this.armazenamento.getStore();
    if (!conexao) throw new SemTransacaoComTenantError();
    return conexao;
  }

  dentroDe<T>(conexao: ConexaoDeBanco, acao: () => Promise<T>): Promise<T> {
    return this.armazenamento.run(conexao, acao);
  }
}
