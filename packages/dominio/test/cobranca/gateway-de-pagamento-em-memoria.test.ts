import { describe, expect, it } from "vitest";
import {
  Dinheiro,
  EstabelecimentoId,
  GatewayDePagamentoEmMemoria,
  GatewayDePagamentoIndisponivelError,
  GeradorSequencialDeIdentificador,
  Instante,
  PedidoDeAssinatura,
  PedidoDeCobranca,
  RelogioFixo,
  TransicaoDeCobrancaInvalidaError,
} from "../../src/index";
import { testarContratoDoGatewayDePagamento } from "./contrato-do-gateway-de-pagamento";

const relogio = new RelogioFixo(Instante.deIso("2026-04-02T12:00:00Z"));

testarContratoDoGatewayDePagamento("em memoria", () => new GatewayDePagamentoEmMemoria(relogio));

describe("GatewayDePagamentoEmMemoria", () => {
  const gerador = new GeradorSequencialDeIdentificador();
  const estabelecimentoId = EstabelecimentoId.de("11111111-1111-4111-8111-111111111111");
  const pedido = (): PedidoDeCobranca =>
    PedidoDeCobranca.criar({
      id: gerador.novo("cobranca"),
      estabelecimentoId,
      valor: Dinheiro.deCentavos(1000),
      venceEm: Instante.deIso("2026-04-10T12:00:00Z"),
      descricao: "Fatura de abril",
    });

  it("falha com erro retentavel enquanto estiver indisponivel", async () => {
    const gateway = new GatewayDePagamentoEmMemoria(relogio);
    gateway.tornarIndisponivel();
    await expect(gateway.criarCobranca(pedido())).rejects.toThrow(
      GatewayDePagamentoIndisponivelError,
    );
    gateway.tornarDisponivel();
    await expect(gateway.criarCobranca(pedido())).resolves.toBeDefined();
  });

  it("pagamento simulado baixa a cobranca uma unica vez, mesmo repetido", async () => {
    const gateway = new GatewayDePagamentoEmMemoria(relogio);
    const criada = await gateway.criarCobranca(pedido());
    const primeira = gateway.simularPagamento(criada.idNoGateway);
    const repetida = gateway.simularPagamento(criada.idNoGateway);
    expect(primeira.estado).toBe("paga");
    expect(repetida.pagaEm?.igual(primeira.pagaEm ?? relogio.agora())).toBe(true);
  });

  it("nao cancela cobranca ja paga nem paga cobranca cancelada", async () => {
    const gateway = new GatewayDePagamentoEmMemoria(relogio);
    const paga = await gateway.criarCobranca(pedido());
    gateway.simularPagamento(paga.idNoGateway);
    await expect(gateway.cancelarCobranca(paga.idNoGateway)).rejects.toThrow(
      TransicaoDeCobrancaInvalidaError,
    );
    const cancelada = await gateway.criarCobranca(pedido());
    await gateway.cancelarCobranca(cancelada.idNoGateway);
    expect(() => gateway.simularPagamento(cancelada.idNoGateway)).toThrow(
      TransicaoDeCobrancaInvalidaError,
    );
  });

  it("cancelar assinatura zera a proxima cobranca e registra a data", async () => {
    const gateway = new GatewayDePagamentoEmMemoria(relogio);
    const criada = await gateway.criarAssinatura(
      PedidoDeAssinatura.criar({
        id: gerador.novo("assinatura"),
        estabelecimentoId,
        planoId: gerador.novo("plano"),
        valor: Dinheiro.deCentavos(9900),
        periodicidade: "anual",
        iniciaEm: Instante.deIso("2026-05-01T12:00:00Z"),
      }),
    );
    expect(criada.proximaCobrancaEm).not.toBeNull();
    const cancelada = await gateway.cancelarAssinatura(criada.idNoGateway);
    expect(cancelada.proximaCobrancaEm).toBeNull();
    expect(cancelada.canceladaEm?.igual(relogio.agora())).toBe(true);
  });
});
