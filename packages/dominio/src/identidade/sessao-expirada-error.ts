import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class SessaoExpiradaError extends ErroDeDominio {
  readonly codigo = "sessao_expirada";

  constructor() {
    super("Sessao expirada.");
  }
}
