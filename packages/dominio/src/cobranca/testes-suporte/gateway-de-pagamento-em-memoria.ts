import type { Relogio } from "../../compartilhado/relogio";
import { AssinaturaNaoEncontradaError } from "../assinatura-nao-encontrada-error";
import { AssinaturaNoGateway } from "../assinatura-no-gateway";
import { CobrancaNaoEncontradaError } from "../cobranca-nao-encontrada-error";
import { CobrancaNoGateway } from "../cobranca-no-gateway";
import type { GatewayDePagamento } from "../gateway-de-pagamento";
import { GatewayDePagamentoIndisponivelError } from "../gateway-de-pagamento-indisponivel-error";
import { IdNoGateway } from "../id-no-gateway";
import type { PedidoDeAssinatura } from "../pedido-de-assinatura";
import type { PedidoDeCobranca } from "../pedido-de-cobranca";

/** Fake de teste: guarda tudo em memoria e permite simular pagamento e indisponibilidade. */
export class GatewayDePagamentoEmMemoria implements GatewayDePagamento {
  private readonly assinaturas = new Map<string, AssinaturaNoGateway>();
  private readonly cobrancas = new Map<string, CobrancaNoGateway>();
  private readonly assinaturaPorPedido = new Map<string, string>();
  private readonly cobrancaPorPedido = new Map<string, string>();
  private indisponivel = false;
  private sequencia = 0;

  constructor(private readonly relogio: Relogio) {}

  async criarAssinatura(pedido: PedidoDeAssinatura): Promise<AssinaturaNoGateway> {
    this.exigirDisponivel();
    const existente = this.assinaturaPorPedido.get(pedido.id.valor);
    if (existente) return this.obterAssinatura(existente);
    const idNoGateway = this.proximoId("assinatura");
    const assinatura = AssinaturaNoGateway.reconstituir({
      idNoGateway,
      pedidoId: pedido.id,
      estabelecimentoId: pedido.estabelecimentoId,
      valor: pedido.valor,
      periodicidade: pedido.periodicidade,
      estado: "ativa",
      proximaCobrancaEm: pedido.iniciaEm,
      canceladaEm: null,
    });
    this.assinaturas.set(idNoGateway.valor, assinatura);
    this.assinaturaPorPedido.set(pedido.id.valor, idNoGateway.valor);
    return assinatura;
  }

  async consultarAssinatura(id: IdNoGateway): Promise<AssinaturaNoGateway> {
    this.exigirDisponivel();
    return this.obterAssinatura(id.valor);
  }

  async cancelarAssinatura(id: IdNoGateway): Promise<AssinaturaNoGateway> {
    this.exigirDisponivel();
    const cancelada = this.obterAssinatura(id.valor).cancelar(this.relogio.agora());
    this.assinaturas.set(id.valor, cancelada);
    return cancelada;
  }

  async criarCobranca(pedido: PedidoDeCobranca): Promise<CobrancaNoGateway> {
    this.exigirDisponivel();
    const existente = this.cobrancaPorPedido.get(pedido.id.valor);
    if (existente) return this.obterCobranca(existente);
    const idNoGateway = this.proximoId("cobranca");
    const cobranca = CobrancaNoGateway.reconstituir({
      idNoGateway,
      pedidoId: pedido.id,
      estabelecimentoId: pedido.estabelecimentoId,
      valor: pedido.valor,
      venceEm: pedido.venceEm,
      estado: "pendente",
      pagaEm: null,
    });
    this.cobrancas.set(idNoGateway.valor, cobranca);
    this.cobrancaPorPedido.set(pedido.id.valor, idNoGateway.valor);
    return cobranca;
  }

  async consultarCobranca(id: IdNoGateway): Promise<CobrancaNoGateway> {
    this.exigirDisponivel();
    return this.obterCobranca(id.valor);
  }

  async cancelarCobranca(id: IdNoGateway): Promise<CobrancaNoGateway> {
    this.exigirDisponivel();
    const cancelada = this.obterCobranca(id.valor).cancelar();
    this.cobrancas.set(id.valor, cancelada);
    return cancelada;
  }

  tornarIndisponivel(): void {
    this.indisponivel = true;
  }

  tornarDisponivel(): void {
    this.indisponivel = false;
  }

  /** Simula o cliente pagando (o que, no mundo real, chegaria por webhook). */
  simularPagamento(id: IdNoGateway): CobrancaNoGateway {
    const paga = this.obterCobranca(id.valor).marcarComoPaga(this.relogio.agora());
    this.cobrancas.set(id.valor, paga);
    return paga;
  }

  private exigirDisponivel(): void {
    if (this.indisponivel) throw new GatewayDePagamentoIndisponivelError();
  }

  private proximoId(prefixo: string): IdNoGateway {
    this.sequencia += 1;
    return IdNoGateway.de(`fake-${prefixo}-${this.sequencia}`);
  }

  private obterAssinatura(id: string): AssinaturaNoGateway {
    const assinatura = this.assinaturas.get(id);
    if (!assinatura) throw new AssinaturaNaoEncontradaError();
    return assinatura;
  }

  private obterCobranca(id: string): CobrancaNoGateway {
    const cobranca = this.cobrancas.get(id);
    if (!cobranca) throw new CobrancaNaoEncontradaError();
    return cobranca;
  }
}
