import { describe, expect, it } from "vitest";
import {
  Instante,
  PoliticaDeCancelamentoPorAntecedencia,
  PoliticaDeCancelamentoInvalidaError,
} from "../../src/index";

const inicio = Instante.deIso("2026-10-27T15:00:00Z");

describe("PoliticaDeCancelamentoPorAntecedencia", () => {
  const duasHoras = PoliticaDeCancelamentoPorAntecedencia.deMinutos(120);

  it("permite cancelar com antecedencia igual ou maior que a minima", () => {
    expect(duasHoras.permite(inicio, Instante.deIso("2026-10-27T13:00:00Z"))).toBe(true);
    expect(duasHoras.permite(inicio, Instante.deIso("2026-10-27T10:00:00Z"))).toBe(true);
  });

  it("recusa quando falta menos que a antecedencia minima", () => {
    expect(duasHoras.permite(inicio, Instante.deIso("2026-10-27T13:00:01Z"))).toBe(false);
    expect(duasHoras.permite(inicio, Instante.deIso("2026-10-27T15:30:00Z"))).toBe(false);
  });

  it("antecedencia zero permite ate o inicio, nunca depois", () => {
    const livre = PoliticaDeCancelamentoPorAntecedencia.deMinutos(0);
    expect(livre.permite(inicio, inicio)).toBe(true);
    expect(livre.permite(inicio, inicio.maisMinutos(1))).toBe(false);
  });

  it("recusa antecedencia negativa ou fracionada", () => {
    expect(() => PoliticaDeCancelamentoPorAntecedencia.deMinutos(-1)).toThrow(
      PoliticaDeCancelamentoInvalidaError,
    );
    expect(() => PoliticaDeCancelamentoPorAntecedencia.deMinutos(1.5)).toThrow(
      PoliticaDeCancelamentoInvalidaError,
    );
  });
});
