import { describe, expect, it } from "vitest";
import {
  Dinheiro,
  Profissional,
  ProfissionalInvalidoError,
  Servico,
  ServicoId,
  ServicoInvalidoError,
  ProfissionalNaoExecutaServicoError,
} from "../../src/index";
import { PROFISSIONAL_A, SERVICO_ID, local, uuid } from "../agenda/suporte";

const dadosDeServico = {
  id: SERVICO_ID,
  nome: "Corte",
  duracaoMinutos: 30,
  preco: Dinheiro.deCentavos(4500),
};

describe("Servico", () => {
  it("nasce ativo, sem intervalo, com os dados informados", () => {
    const s = Servico.criar(dadosDeServico);
    expect(s.ativo).toBe(true);
    expect(s.intervaloAposMinutos).toBe(0);
    expect(s.preco.centavos).toBe(4500);
  });

  it("recusa nome vazio, duracao nao positiva ou fracionada e intervalo negativo ou enorme", () => {
    for (const ruim of [
      { nome: "  " },
      { duracaoMinutos: 0 },
      { duracaoMinutos: 20.5 },
      { duracaoMinutos: 24 * 60 + 1 },
      { intervaloAposMinutos: -1 },
      { intervaloAposMinutos: Servico.INTERVALO_MAXIMO_MINUTOS + 1 },
    ]) {
      expect(() => Servico.criar({ ...dadosDeServico, ...ruim })).toThrow(ServicoInvalidoError);
    }
  });

  it("calcula a janela do atendimento e a janela ocupada com o intervalo", () => {
    const s = Servico.criar({ ...dadosDeServico, intervaloAposMinutos: 10 });
    const inicio = local("2026-10-27", 10);
    expect(s.janelaEm(inicio).duracaoEmMinutos()).toBe(30);
    expect(s.janelaOcupadaEm(inicio).duracaoEmMinutos()).toBe(40);
  });

  it("alteracoes devolvem nova instancia e preservam a original", () => {
    const original = Servico.criar(dadosDeServico);
    const novo = original.comPreco(Dinheiro.deCentavos(5000)).comDuracao(45).desativar();
    expect(novo.preco.centavos).toBe(5000);
    expect(novo.duracaoMinutos).toBe(45);
    expect(novo.ativo).toBe(false);
    expect(original.preco.centavos).toBe(4500);
    expect(original.ativo).toBe(true);
    expect(novo.ativar().ativo).toBe(true);
  });

  it("a duracao nova tambem e validada", () => {
    expect(() => Servico.criar(dadosDeServico).comDuracao(0)).toThrow(ServicoInvalidoError);
  });
});

describe("Profissional", () => {
  const outroServico = ServicoId.de(uuid(77));
  const base = { id: PROFISSIONAL_A, nome: "Joao", servicosIds: [SERVICO_ID] };

  it("executa apenas os servicos associados", () => {
    const p = Profissional.criar(base);
    expect(p.executa(SERVICO_ID)).toBe(true);
    expect(p.executa(outroServico)).toBe(false);
  });

  it("so atende quando ativo e executa o servico", () => {
    const p = Profissional.criar(base);
    expect(p.atende(SERVICO_ID)).toBe(true);
    expect(p.desativar().atende(SERVICO_ID)).toBe(false);
  });

  it("exigirExecucaoDe falha com erro de dominio quando nao executa", () => {
    expect(() => Profissional.criar(base).exigirExecucaoDe(outroServico)).toThrow(
      ProfissionalNaoExecutaServicoError,
    );
  });

  it("associar e dissociar servicos devolve nova instancia sem duplicar", () => {
    const p = Profissional.criar(base);
    const com = p.comServico(outroServico).comServico(outroServico);
    expect(com.servicosIds).toHaveLength(2);
    expect(com.semServico(SERVICO_ID).executa(SERVICO_ID)).toBe(false);
    expect(p.servicosIds).toHaveLength(1);
  });

  it("recusa nome vazio", () => {
    expect(() => Profissional.criar({ ...base, nome: "" })).toThrow(ProfissionalInvalidoError);
  });
});
