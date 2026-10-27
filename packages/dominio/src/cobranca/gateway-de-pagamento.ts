import type { AssinaturaNoGateway } from "./assinatura-no-gateway";
import type { CobrancaNoGateway } from "./cobranca-no-gateway";
import type { IdNoGateway } from "./id-no-gateway";
import type { PedidoDeAssinatura } from "./pedido-de-assinatura";
import type { PedidoDeCobranca } from "./pedido-de-cobranca";

/**
 * Porta de cobranca do estabelecimento. Nao assume fornecedor (decisao em aberto, plano.md
 * secao 10): trocar o gateway exige alterar apenas o adaptador, que roda o teste de contrato
 * `testarContratoDoGatewayDePagamento`.
 *
 * Contrato:
 * - `criarAssinatura`/`criarCobranca` sao idempotentes por `pedido.id`: repetir devolve o mesmo
 *   recurso, sem criar outro.
 * - `consultar*` e `cancelar*` de id desconhecido lancam `AssinaturaNaoEncontradaError` ou
 *   `CobrancaNaoEncontradaError`.
 * - `cancelarAssinatura` e idempotente. `cancelarCobranca` falha com
 *   `TransicaoDeCobrancaInvalidaError` se ja foi paga.
 * - Falha transitoria lanca `GatewayDePagamentoIndisponivelError`; recusa definitiva,
 *   `PedidoRecusadoPeloGatewayError`.
 */
export interface GatewayDePagamento {
  criarAssinatura(pedido: PedidoDeAssinatura): Promise<AssinaturaNoGateway>;
  consultarAssinatura(id: IdNoGateway): Promise<AssinaturaNoGateway>;
  cancelarAssinatura(id: IdNoGateway): Promise<AssinaturaNoGateway>;
  criarCobranca(pedido: PedidoDeCobranca): Promise<CobrancaNoGateway>;
  consultarCobranca(id: IdNoGateway): Promise<CobrancaNoGateway>;
  cancelarCobranca(id: IdNoGateway): Promise<CobrancaNoGateway>;
}
