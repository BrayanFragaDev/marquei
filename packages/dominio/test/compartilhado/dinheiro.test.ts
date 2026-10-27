import { describe, expect, it } from "vitest";
import { Dinheiro, DinheiroInvalidoError } from "../../src/index";

describe("Dinheiro", () => {
  it("guarda centavos inteiros", () => {
    expect(Dinheiro.deCentavos(4990).centavos).toBe(4990);
  });

  it("recusa valor fracionario, negativo ou nao numerico", () => {
    expect(() => Dinheiro.deCentavos(10.5)).toThrow(DinheiroInvalidoError);
    expect(() => Dinheiro.deCentavos(-1)).toThrow(DinheiroInvalidoError);
    expect(() => Dinheiro.deCentavos(Number.NaN)).toThrow(DinheiroInvalidoError);
  });

  it("soma sem erro de ponto flutuante", () => {
    const total = Dinheiro.deCentavos(10).somar(Dinheiro.deCentavos(20));
    expect(total.centavos).toBe(30);
  });

  it("nao permite subtrair alem do saldo", () => {
    const dez = Dinheiro.deCentavos(1000);
    expect(dez.subtrair(Dinheiro.deCentavos(400)).centavos).toBe(600);
    expect(() => dez.subtrair(Dinheiro.deCentavos(1001))).toThrow(DinheiroInvalidoError);
  });

  it("multiplica por quantidade inteira e recusa fator fracionario", () => {
    expect(Dinheiro.deCentavos(2500).multiplicarPor(3).centavos).toBe(7500);
    expect(() => Dinheiro.deCentavos(2500).multiplicarPor(1.5)).toThrow(DinheiroInvalidoError);
  });

  it("compara valores", () => {
    expect(Dinheiro.zero().ehZero()).toBe(true);
    expect(Dinheiro.deCentavos(5).igual(Dinheiro.deCentavos(5))).toBe(true);
    expect(Dinheiro.deCentavos(6).maiorQue(Dinheiro.deCentavos(5))).toBe(true);
  });
});
