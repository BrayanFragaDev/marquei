import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class CobrancaNaoEncontradaError extends ErroDeDominio {
  readonly codigo = "cobranca_nao_encontrada";

  constructor() {
    super("Cobranca nao encontrada no gateway de pagamento.");
  }
}
