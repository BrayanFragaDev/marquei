import { describe, expect, it } from "vitest";
import {
  ContatoDeMensagem,
  DestinatarioInvalidoError,
  IdDaMensagemNoProvedor,
  IdDoProvedorInvalidoError,
  Instante,
  ModeloDeMensagem,
  ModeloDeMensagemInvalidoError,
  ResultadoDoEnvio,
  Telefone,
  TransicaoDeEnvioInvalidaError,
} from "../../src/index";

describe("Telefone", () => {
  it("normaliza separadores para E.164", () => {
    expect(Telefone.de("+55 (11) 98765-4321").e164).toBe("+5511987654321");
  });

  it("recusa numero sem codigo do pais ou fora do tamanho", () => {
    expect(() => Telefone.de("11987654321")).toThrow(DestinatarioInvalidoError);
    expect(() => Telefone.de("+123")).toThrow(DestinatarioInvalidoError);
    expect(() => Telefone.de("+55abc")).toThrow(DestinatarioInvalidoError);
  });

  it("mascara o numero para logs e nao vaza o numero na mensagem de erro", () => {
    expect(Telefone.de("+5511987654321").mascarado()).toBe("+55*********21");
    expect(() => Telefone.de("987")).toThrow(/E\.164/);
    try {
      Telefone.de("987");
    } catch (erro) {
      expect(String(erro)).not.toContain("987");
    }
  });
});

describe("ContatoDeMensagem", () => {
  it("guarda o canal junto do endereco", () => {
    const sms = ContatoDeMensagem.deTelefone("sms", Telefone.de("+5511987654321"));
    expect(sms.canal).toBe("sms");
    expect(sms.endereco).toBe("+5511987654321");
  });

  it("normaliza e valida e-mail", () => {
    expect(ContatoDeMensagem.deEmail("  Ana@Exemplo.com ").endereco).toBe("ana@exemplo.com");
    expect(() => ContatoDeMensagem.deEmail("sem-arroba")).toThrow(DestinatarioInvalidoError);
  });

  it("recusa token de push vazio ou com espacos", () => {
    expect(() => ContatoDeMensagem.dePush("")).toThrow(DestinatarioInvalidoError);
    expect(() => ContatoDeMensagem.dePush("a b")).toThrow(DestinatarioInvalidoError);
  });

  it("contatos de canais diferentes nunca sao iguais e o mascarado esconde o endereco", () => {
    const tel = Telefone.de("+5511987654321");
    expect(
      ContatoDeMensagem.deTelefone("sms", tel).igual(ContatoDeMensagem.deTelefone("whatsapp", tel)),
    ).toBe(false);
    expect(ContatoDeMensagem.deEmail("ana@exemplo.com").mascarado()).not.toContain("ana");
  });
});

describe("ModeloDeMensagem", () => {
  it("exige chave em snake_case", () => {
    expect(() => ModeloDeMensagem.criar("Lembrete")).toThrow(ModeloDeMensagemInvalidoError);
    expect(ModeloDeMensagem.criar("lembrete_24h").chave).toBe("lembrete_24h");
  });

  it("recusa nome de variavel invalido", () => {
    expect(() => ModeloDeMensagem.criar("lembrete", { "Nome Cliente": "x" })).toThrow(
      ModeloDeMensagemInvalidoError,
    );
  });

  it("e imutavel: comVariavel devolve novo modelo e nao altera o original", () => {
    const original = ModeloDeMensagem.criar("lembrete", { hora: "10:00" });
    const novo = original.comVariavel("hora", "11:00").comVariavel("servico", "corte");
    expect(original.variavel("hora")).toBe("10:00");
    expect(original.temVariavel("servico")).toBe(false);
    expect(novo.variavel("hora")).toBe("11:00");
    expect(novo.variavel("servico")).toBe("corte");
  });

  it("nao e afetado por mudanca no objeto de entrada nem na copia devolvida", () => {
    const entrada = { hora: "10:00" };
    const modelo = ModeloDeMensagem.criar("lembrete", entrada);
    entrada.hora = "23:00";
    const copia = { ...modelo.variaveis() };
    copia.hora = "00:00";
    expect(modelo.variavel("hora")).toBe("10:00");
  });
});

describe("IdDaMensagemNoProvedor", () => {
  it("recusa vazio e longo demais", () => {
    expect(() => IdDaMensagemNoProvedor.de("  ")).toThrow(IdDoProvedorInvalidoError);
    expect(() => IdDaMensagemNoProvedor.de("x".repeat(129))).toThrow(IdDoProvedorInvalidoError);
  });
});

describe("ResultadoDoEnvio", () => {
  const t0 = Instante.deIso("2026-03-10T12:00:00Z");
  const t1 = Instante.deIso("2026-03-10T12:00:05Z");
  const aceito = (): ResultadoDoEnvio =>
    ResultadoDoEnvio.aceito(IdDaMensagemNoProvedor.de("abc"), "sms", t0);

  it("nasce aceito e nao final", () => {
    expect(aceito().estado).toBe("aceita");
    expect(aceito().ehFinal()).toBe(false);
  });

  it("entrega e imutavel e idempotente", () => {
    const original = aceito();
    const entregue = original.marcarComoEntregue(t1);
    expect(original.estado).toBe("aceita");
    expect(entregue.estado).toBe("entregue");
    expect(entregue.marcarComoEntregue(t0)).toBe(entregue);
  });

  it("falha guarda o motivo e estado final nao muda", () => {
    const falhou = aceito().marcarComoFalha("sem credito", t1);
    expect(falhou.motivoDaFalha).toBe("sem credito");
    expect(() => falhou.marcarComoEntregue(t1)).toThrow(TransicaoDeEnvioInvalidaError);
    expect(() => falhou.marcarComoFalha("outra", t1)).toThrow(TransicaoDeEnvioInvalidaError);
  });
});
