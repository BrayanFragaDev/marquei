import { ErroDeDominio } from "@marquei/dominio";

export class SemTransacaoComTenantError extends ErroDeDominio {
  readonly codigo = "sem_transacao_com_tenant";

  constructor() {
    super("Acesso ao banco fora de uma transacao com tenant. Use ExecutorTransacional.executar().");
  }
}
