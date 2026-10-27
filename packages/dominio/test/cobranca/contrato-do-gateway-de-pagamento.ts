import { describe, expect, it } from "vitest";
import {
  AssinaturaNaoEncontradaError,
  CobrancaNaoEncontradaError,
  Dinheiro,
  EstabelecimentoId,
  GeradorSequencialDeIdentificador,
  IdNoGateway,
  Instante,
  PedidoDeAssinatura,
  PedidoDeCobranca,
} from "../../src/index";
import type { GatewayDePagamento } from "../../src/index";

const ESTABELECIMENTO = EstabelecimentoId.de("11111111-1111-4111-8111-111111111111");
const INICIO = Instante.deIso("2026-04-01T12:00:00Z");
const DESCONHECIDO = IdNoGateway.de("nao-existe-999");

/**
 * Teste de contrato reutilizavel da porta `GatewayDePagamento`. Todo adaptador (fake ou real,
 * apontado para sandbox) deve passar. `fabrica` devolve um gateway novo e vazio a cada teste.
 */
export function testarContratoDoGatewayDePagamento(
  nome: string,
  fabrica: () => GatewayDePagamento,
): void {
  describe(`contrato de GatewayDePagamento: ${nome}`, () => {
    const gerador = new GeradorSequencialDeIdentificador();
    const pedidoDeAssinatura = (): PedidoDeAssinatura =>
      PedidoDeAssinatura.criar({
        id: gerador.novo("assinatura"),
        estabelecimentoId: ESTABELECIMENTO,
        planoId: gerador.novo("plano"),
        valor: Dinheiro.deCentavos(14900),
        periodicidade: "mensal",
        iniciaEm: INICIO,
      });
    const pedidoDeCobranca = (): PedidoDeCobranca =>
      PedidoDeCobranca.criar({
        id: gerador.novo("cobranca"),
        estabelecimentoId: ESTABELECIMENTO,
        valor: Dinheiro.deCentavos(4990),
        venceEm: INICIO.maisMinutos(60 * 24 * 5),
        descricao: "Ajuste pro-rata do plano",
      });

    describe("assinatura", () => {
      it("cria a assinatura refletindo os dados do pedido", async () => {
        const pedido = pedidoDeAssinatura();
        const assinatura = await fabrica().criarAssinatura(pedido);
        expect(assinatura.pedidoId.igual(pedido.id)).toBe(true);
        expect(assinatura.estabelecimentoId.igual(pedido.estabelecimentoId)).toBe(true);
        expect(assinatura.valor.igual(pedido.valor)).toBe(true);
        expect(assinatura.periodicidade).toBe("mensal");
        expect(assinatura.ehCancelada()).toBe(false);
      });

      it("e idempotente por pedido: repetir nao cria segunda assinatura", async () => {
        const gateway = fabrica();
        const pedido = pedidoDeAssinatura();
        const primeira = await gateway.criarAssinatura(pedido);
        const segunda = await gateway.criarAssinatura(pedido);
        expect(segunda.idNoGateway.igual(primeira.idNoGateway)).toBe(true);
      });

      it("consulta pelo id do gateway", async () => {
        const gateway = fabrica();
        const criada = await gateway.criarAssinatura(pedidoDeAssinatura());
        const consultada = await gateway.consultarAssinatura(criada.idNoGateway);
        expect(consultada.idNoGateway.igual(criada.idNoGateway)).toBe(true);
      });

      it("cancela e o cancelamento e idempotente", async () => {
        const gateway = fabrica();
        const criada = await gateway.criarAssinatura(pedidoDeAssinatura());
        const cancelada = await gateway.cancelarAssinatura(criada.idNoGateway);
        const denovo = await gateway.cancelarAssinatura(criada.idNoGateway);
        expect(cancelada.ehCancelada()).toBe(true);
        expect(denovo.ehCancelada()).toBe(true);
        expect((await gateway.consultarAssinatura(criada.idNoGateway)).ehCancelada()).toBe(true);
      });

      it("falha com AssinaturaNaoEncontradaError para id desconhecido", async () => {
        const gateway = fabrica();
        await expect(gateway.consultarAssinatura(DESCONHECIDO)).rejects.toThrow(
          AssinaturaNaoEncontradaError,
        );
        await expect(gateway.cancelarAssinatura(DESCONHECIDO)).rejects.toThrow(
          AssinaturaNaoEncontradaError,
        );
      });
    });

    describe("cobranca avulsa", () => {
      it("cria a cobranca pendente refletindo os dados do pedido", async () => {
        const pedido = pedidoDeCobranca();
        const cobranca = await fabrica().criarCobranca(pedido);
        expect(cobranca.pedidoId.igual(pedido.id)).toBe(true);
        expect(cobranca.valor.igual(pedido.valor)).toBe(true);
        expect(cobranca.venceEm.igual(pedido.venceEm)).toBe(true);
        expect(cobranca.estado).toBe("pendente");
      });

      it("e idempotente por pedido: repetir nao cria segunda cobranca", async () => {
        const gateway = fabrica();
        const pedido = pedidoDeCobranca();
        const primeira = await gateway.criarCobranca(pedido);
        const segunda = await gateway.criarCobranca(pedido);
        expect(segunda.idNoGateway.igual(primeira.idNoGateway)).toBe(true);
      });

      it("consulta e cancela uma cobranca pendente, de forma idempotente", async () => {
        const gateway = fabrica();
        const criada = await gateway.criarCobranca(pedidoDeCobranca());
        expect((await gateway.consultarCobranca(criada.idNoGateway)).estado).toBe("pendente");
        expect((await gateway.cancelarCobranca(criada.idNoGateway)).estado).toBe("cancelada");
        expect((await gateway.cancelarCobranca(criada.idNoGateway)).estado).toBe("cancelada");
      });

      it("falha com CobrancaNaoEncontradaError para id desconhecido", async () => {
        const gateway = fabrica();
        await expect(gateway.consultarCobranca(DESCONHECIDO)).rejects.toThrow(
          CobrancaNaoEncontradaError,
        );
        await expect(gateway.cancelarCobranca(DESCONHECIDO)).rejects.toThrow(
          CobrancaNaoEncontradaError,
        );
      });
    });
  });
}
