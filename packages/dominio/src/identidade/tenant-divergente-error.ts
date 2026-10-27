import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

/** O cliente informou um estabelecimento diferente do da sessao autenticada. */
export class TenantDivergenteError extends ErroDeDominio {
  readonly codigo = "tenant_divergente";

  constructor() {
    super("O estabelecimento informado diverge do da sessao.");
  }
}
