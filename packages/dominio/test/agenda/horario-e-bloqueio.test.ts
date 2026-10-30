import { describe, expect, it } from "vitest";
import {
  Bloqueio,
  BloqueioId,
  DiaCivil,
  HorarioDeTrabalho,
  HorarioDeTrabalhoInvalidoError,
  JanelaDeTempo,
  ProfissionalId,
} from "../../src/index";
import { ESTABELECIMENTO, PROFISSIONAL_A, SP, h, local, uuid } from "./suporte";

describe("HorarioDeTrabalho", () => {
  const criar = (diaDaSemana: number, inicioMinutos: number, fimMinutos: number) =>
    HorarioDeTrabalho.criar({
      profissionalId: PROFISSIONAL_A,
      diaDaSemana: diaDaSemana as 0,
      inicioMinutos,
      fimMinutos,
    });

  it("recusa intervalo que nao termina depois de comecar", () => {
    expect(() => criar(1, h(10), h(10))).toThrow(HorarioDeTrabalhoInvalidoError);
    expect(() => criar(1, h(12), h(9))).toThrow(HorarioDeTrabalhoInvalidoError);
  });

  it("recusa dia da semana e minutos fora da faixa ou nao inteiros", () => {
    expect(() => criar(7, h(9), h(10))).toThrow(HorarioDeTrabalhoInvalidoError);
    expect(() => criar(1, -1, h(10))).toThrow(HorarioDeTrabalhoInvalidoError);
    expect(() => criar(1, h(9), h(24) + 1)).toThrow(HorarioDeTrabalhoInvalidoError);
    expect(() => criar(1, 9.5, h(10))).toThrow(HorarioDeTrabalhoInvalidoError);
  });

  it("aplica-se somente ao dia da semana configurado", () => {
    const terca = criar(2, h(9), h(12));
    expect(terca.aplicaEm(DiaCivil.deTexto("2026-10-27"))).toBe(true);
    expect(terca.aplicaEm(DiaCivil.deTexto("2026-10-28"))).toBe(false);
  });

  it("resolve a janela no fuso do estabelecimento; 24:00 e a meia-noite seguinte", () => {
    const noite = criar(2, h(22), h(24));
    const janela = noite.janelaEm(DiaCivil.deTexto("2026-10-27"), SP);
    expect(janela.inicio.paraIso()).toBe("2026-10-28T01:00:00.000Z");
    expect(janela.fim.paraIso()).toBe("2026-10-28T03:00:00.000Z");
  });
});

describe("Bloqueio", () => {
  it("recusa janela invertida pelo proprio objeto de valor da janela", () => {
    expect(() => JanelaDeTempo.criar(local("2026-10-27", 10), local("2026-10-27", 9))).toThrow();
  });

  it("vale para o profissional dele e, sem profissional, para toda a equipe", () => {
    const janela = JanelaDeTempo.comDuracao(local("2026-10-27", 10), 60);
    const dele = Bloqueio.criar({
      id: BloqueioId.de(uuid(1)),
      estabelecimentoId: ESTABELECIMENTO,
      profissionalId: PROFISSIONAL_A,
      janela,
      motivo: "",
    });
    const geral = Bloqueio.criar({
      id: BloqueioId.de(uuid(2)),
      estabelecimentoId: ESTABELECIMENTO,
      profissionalId: null,
      janela,
      motivo: "feriado",
    });
    const outro = ProfissionalId.de(uuid(99));
    expect(dele.valePara(PROFISSIONAL_A)).toBe(true);
    expect(dele.valePara(outro)).toBe(false);
    expect(geral.valePara(PROFISSIONAL_A)).toBe(true);
  });

  it("folga cobre o dia local inteiro, inclusive em dia de 25h", () => {
    const folga = Bloqueio.diaInteiro({
      id: BloqueioId.de(uuid(3)),
      estabelecimentoId: ESTABELECIMENTO,
      profissionalId: PROFISSIONAL_A,
      dia: DiaCivil.deTexto("2019-02-16"),
      fuso: SP,
      motivo: "folga",
    });
    expect(folga.janela.duracaoEmMinutos()).toBe(25 * 60);
  });

  it("bloqueia janelas que se sobrepoem e nao as que apenas encostam", () => {
    const b = Bloqueio.criar({
      id: BloqueioId.de(uuid(4)),
      estabelecimentoId: ESTABELECIMENTO,
      profissionalId: null,
      janela: JanelaDeTempo.criar(local("2026-10-27", 10), local("2026-10-27", 11)),
      motivo: "",
    });
    expect(
      b.bloqueia(JanelaDeTempo.criar(local("2026-10-27", 10, 30), local("2026-10-27", 12))),
    ).toBe(true);
    expect(b.bloqueia(JanelaDeTempo.criar(local("2026-10-27", 11), local("2026-10-27", 12)))).toBe(
      false,
    );
  });
});
