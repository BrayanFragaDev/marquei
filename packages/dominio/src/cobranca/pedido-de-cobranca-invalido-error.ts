import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class PedidoDeCobrancaInvalidoError extends ErroDeDominio {
  readonly codigo = "pedido_de_cobranca_invalido";

  constructor(motivo: string) {
    super(`Pedido de cobranca invalido: ${motivo}.`);
  }
}
