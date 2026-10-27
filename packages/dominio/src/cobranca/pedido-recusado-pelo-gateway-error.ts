import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

/** Falha definitiva: o gateway recusou o pedido; repetir sem mudar os dados nao resolve. */
export class PedidoRecusadoPeloGatewayError extends ErroDeDominio {
  readonly codigo = "pedido_recusado_pelo_gateway";
  readonly retentavel = false;

  constructor(motivo: string, opcoes?: ErrorOptions) {
    super(`O gateway de pagamento recusou o pedido: ${motivo}.`, opcoes);
  }
}
