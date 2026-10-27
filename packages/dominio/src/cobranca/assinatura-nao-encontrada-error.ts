import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class AssinaturaNaoEncontradaError extends ErroDeDominio {
  readonly codigo = "assinatura_nao_encontrada";

  constructor() {
    super("Assinatura nao encontrada no gateway de pagamento.");
  }
}
