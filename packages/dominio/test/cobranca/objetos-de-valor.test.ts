import { describe, expect, it } from "vitest";
import {
  CobrancaNoGateway,
  Dinheiro,
  EstabelecimentoId,
  GeradorSequencialDeIdentificador,
  IdNoGateway,
  IdNoGatewayInvalidoError,
  Instante,
  PedidoDeAssinatura,
  PedidoDeCobranca,
  PedidoDeCobrancaInvalidoError,
} from "../../src/index";

const gerador = new GeradorSequencialDeIdentificador();
const estabelecimentoId = EstabelecimentoId.de("11111111-1111-4111-8111-111111111111");
const venceEm = Instante.deIso("2026-04-10T12:00:00Z");

describe("PedidoDeAssinatura", () => {
  it("recusa valor zero", () => {
    expect(() =>
      PedidoDeAssinatura.criar({
        id: gerador.novo("assinatura"),
        estabelecimentoId,
        planoId: gerador.novo("plano"),
        valor: Dinheiro.zero(),
        periodicidade: "mensal",
        iniciaEm: venceEm,
      }),
    ).toThrow(PedidoDeCobrancaInvalidoError);
  });
});

describe("PedidoDeCobranca", () => {
  const dados = {
    id: gerador.novo("cobranca"),
    estabelecimentoId,
    valor: Dinheiro.deCentavos(500),
    venceEm,
  };

  it("recusa valor zero e descricao vazia ou longa demais", () => {
    expect(() =>
      PedidoDeCobranca.criar({ ...dados, valor: Dinheiro.zero(), descricao: "x" }),
    ).toThrow(PedidoDeCobrancaInvalidoError);
    expect(() => PedidoDeCobranca.criar({ ...dados, descricao: "   " })).toThrow(
      PedidoDeCobrancaInvalidoError,
    );
    expect(() => PedidoDeCobranca.criar({ ...dados, descricao: "x".repeat(141) })).toThrow(
      PedidoDeCobrancaInvalidoError,
    );
  });

  it("apara espacos da descricao", () => {
    expect(PedidoDeCobranca.criar({ ...dados, descricao: "  Fatura  " }).descricao).toBe("Fatura");
  });
});

describe("IdNoGateway", () => {
  it("recusa vazio e longo demais", () => {
    expect(() => IdNoGateway.de("")).toThrow(IdNoGatewayInvalidoError);
    expect(() => IdNoGateway.de("x".repeat(129))).toThrow(IdNoGatewayInvalidoError);
  });
});

describe("CobrancaNoGateway", () => {
  const pendente = CobrancaNoGateway.reconstituir({
    idNoGateway: IdNoGateway.de("c-1"),
    pedidoId: gerador.novo("cobranca"),
    estabelecimentoId,
    valor: Dinheiro.deCentavos(500),
    venceEm,
    estado: "pendente",
    pagaEm: null,
  });

  it("esta vencida somente se pendente e depois do vencimento", () => {
    expect(pendente.estaVencidaEm(venceEm.maisMinutos(1))).toBe(true);
    expect(pendente.estaVencidaEm(venceEm.maisMinutos(-1))).toBe(false);
    expect(pendente.marcarComoPaga(venceEm).estaVencidaEm(venceEm.maisMinutos(1))).toBe(false);
  });

  it("marcar como paga e imutavel e mantem a primeira data de pagamento", () => {
    const paga = pendente.marcarComoPaga(venceEm);
    expect(pendente.estado).toBe("pendente");
    expect(paga.marcarComoPaga(venceEm.maisMinutos(60))).toBe(paga);
  });
});
