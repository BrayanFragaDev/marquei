import { describe, expect, it } from "vitest";
import { Instante, InstanteInvalidoError } from "../../src/index";

describe("Instante", () => {
  it("le e escreve ISO 8601 em UTC sem perder precisao", () => {
    const instante = Instante.deIso("2026-10-27T11:00:00.000Z");
    expect(instante.paraIso()).toBe("2026-10-27T11:00:00.000Z");
  });

  it("recusa texto sem o sufixo Z de UTC", () => {
    expect(() => Instante.deIso("2026-10-27T11:00:00-03:00")).toThrow(InstanteInvalidoError);
    expect(() => Instante.deIso("2026-10-27")).toThrow(InstanteInvalidoError);
  });

  it("recusa datas que nao existem no calendario", () => {
    expect(() => Instante.deIso("2026-02-30T10:00:00Z")).toThrow(InstanteInvalidoError);
  });

  it("recusa epoch que nao e inteiro", () => {
    expect(() => Instante.deEpochMs(1.5)).toThrow(InstanteInvalidoError);
    expect(() => Instante.deEpochMs(Number.NaN)).toThrow(InstanteInvalidoError);
  });

  it("soma minutos devolvendo nova instancia e mantendo a original", () => {
    const base = Instante.deIso("2026-10-27T11:00:00Z");
    const depois = base.maisMinutos(90);
    expect(depois.paraIso()).toBe("2026-10-27T12:30:00.000Z");
    expect(base.paraIso()).toBe("2026-10-27T11:00:00.000Z");
  });

  it("compara ordem e igualdade", () => {
    const a = Instante.deIso("2026-10-27T11:00:00Z");
    const b = a.maisMinutos(1);
    expect(a.antesDe(b)).toBe(true);
    expect(b.depoisDe(a)).toBe(true);
    expect(a.igual(Instante.deIso("2026-10-27T11:00:00Z"))).toBe(true);
    expect(a.antesDe(a)).toBe(false);
  });

  it("calcula minutos ate outro instante, com sinal", () => {
    const a = Instante.deIso("2026-10-27T11:00:00Z");
    expect(a.minutosAte(a.maisMinutos(45))).toBe(45);
    expect(a.minutosAte(a.maisMinutos(-15))).toBe(-15);
  });

  it("ordena uma lista de forma crescente", () => {
    const a = Instante.deIso("2026-10-27T11:00:00Z");
    const lista = [a.maisMinutos(30), a, a.maisMinutos(10)];
    expect(lista.sort((x, y) => x.compararCom(y)).map((i) => a.minutosAte(i))).toEqual([0, 10, 30]);
  });
});
