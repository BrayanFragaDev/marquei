import { describe, expect, it } from "vitest";
import {
  DiaCivil,
  DiaCivilInvalidoError,
  FusoHorario,
  FusoHorarioInvalidoError,
  Instante,
} from "../../src/index";

const SP = FusoHorario.de("America/Sao_Paulo");

describe("DiaCivil", () => {
  it("le e escreve YYYY-MM-DD", () => {
    expect(DiaCivil.deTexto("2026-10-27").paraTexto()).toBe("2026-10-27");
  });

  it("recusa formato errado e datas inexistentes", () => {
    for (const texto of ["27/10/2026", "2026-13-01", "2026-02-30", "2026-1-1", ""]) {
      expect(() => DiaCivil.deTexto(texto)).toThrow(DiaCivilInvalidoError);
    }
  });

  it("calcula o dia da semana (0 = domingo)", () => {
    expect(DiaCivil.deTexto("2026-10-25").diaDaSemana()).toBe(0);
    expect(DiaCivil.deTexto("2026-10-27").diaDaSemana()).toBe(2);
    expect(DiaCivil.deTexto("2026-10-31").diaDaSemana()).toBe(6);
  });

  it("soma dias atravessando mes e ano", () => {
    expect(DiaCivil.deTexto("2026-12-31").maisDias(1).paraTexto()).toBe("2027-01-01");
    expect(DiaCivil.deTexto("2028-03-01").maisDias(-1).paraTexto()).toBe("2028-02-29");
  });
});

describe("FusoHorario", () => {
  it("recusa fuso que nao existe", () => {
    expect(() => FusoHorario.de("Marte/Olimpo")).toThrow(FusoHorarioInvalidoError);
  });

  it("converte hora local em instante UTC (Sao Paulo e UTC-3 em outubro de 2026)", () => {
    const dia = DiaCivil.deTexto("2026-10-27");
    expect(SP.instanteDe(dia, 9 * 60).paraIso()).toBe("2026-10-27T12:00:00.000Z");
  });

  it("o dia civil local nao e o dia UTC: 22h em Sao Paulo ja e o dia seguinte em UTC", () => {
    const instante = Instante.deIso("2026-10-28T01:30:00Z");
    expect(SP.diaCivilDe(instante).paraTexto()).toBe("2026-10-27");
  });

  it("meia-noite local fecha o dia: 00:00 UTC-3 ainda e o dia anterior as 02:59Z", () => {
    expect(SP.diaCivilDe(Instante.deIso("2026-10-27T02:59:00Z")).paraTexto()).toBe("2026-10-26");
    expect(SP.diaCivilDe(Instante.deIso("2026-10-27T03:00:00Z")).paraTexto()).toBe("2026-10-27");
  });

  it("janela do dia tem 24h em dia comum", () => {
    const janela = SP.janelaDoDia(DiaCivil.deTexto("2026-10-27"));
    expect(janela.inicio.paraIso()).toBe("2026-10-27T03:00:00.000Z");
    expect(janela.duracaoEmMinutos()).toBe(24 * 60);
  });

  describe("horario de verao historico do Brasil", () => {
    it("em 04/11/2018 o verao comecou a meia-noite: o dia tem 23h e 00:00 nao existe", () => {
      const dia = DiaCivil.deTexto("2018-11-04");
      expect(SP.janelaDoDia(dia).duracaoEmMinutos()).toBe(23 * 60);
      // 00:30 local nao existiu: cai para depois do salto, 01:30 local (UTC-2) = 03:30Z.
      expect(SP.instanteDe(dia, 30).paraIso()).toBe("2018-11-04T03:30:00.000Z");
      expect(SP.instanteDe(dia, 9 * 60).paraIso()).toBe("2018-11-04T11:00:00.000Z");
    });

    it("em 17/02/2019 o verao terminou: 16/02 tem 25h e a hora repetida usa a primeira ocorrencia", () => {
      const dia = DiaCivil.deTexto("2019-02-16");
      expect(SP.janelaDoDia(dia).duracaoEmMinutos()).toBe(25 * 60);
      // 23:30 local ocorreu duas vezes (UTC-2 e UTC-3): vale a primeira, 01:30Z do dia 17.
      expect(SP.instanteDe(dia, 23 * 60 + 30).paraIso()).toBe("2019-02-17T01:30:00.000Z");
    });

    it("durante o verao de 2018/2019 o deslocamento e UTC-2", () => {
      expect(SP.instanteDe(DiaCivil.deTexto("2019-01-10"), 9 * 60).paraIso()).toBe(
        "2019-01-10T11:00:00.000Z",
      );
    });

    it("sem verao desde 2019: 15/01/2026 usa UTC-3", () => {
      expect(SP.instanteDe(DiaCivil.deTexto("2026-01-15"), 9 * 60).paraIso()).toBe(
        "2026-01-15T12:00:00.000Z",
      );
    });
  });
});
