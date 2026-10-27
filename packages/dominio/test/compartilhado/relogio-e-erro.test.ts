import { describe, expect, it } from "vitest";
import { ErroDeDominio, Instante, RelogioFixo } from "../../src/index";

class ErroDeExemplo extends ErroDeDominio {
  readonly codigo = "erro_de_exemplo";
}

describe("RelogioFixo", () => {
  it("sempre devolve a mesma hora e avanca criando outro relogio", () => {
    const inicio = Instante.deIso("2026-10-27T11:00:00Z");
    const relogio = new RelogioFixo(inicio);
    expect(relogio.agora().igual(inicio)).toBe(true);
    expect(relogio.agora().igual(inicio)).toBe(true);
    const depois = relogio.avancadoEm(60);
    expect(depois.agora().paraIso()).toBe("2026-10-27T12:00:00.000Z");
    expect(relogio.agora().igual(inicio)).toBe(true);
  });
});

describe("ErroDeDominio", () => {
  it("expoe codigo estavel e nome da classe concreta", () => {
    const erro = new ErroDeExemplo("falhou");
    expect(erro).toBeInstanceOf(Error);
    expect(erro.codigo).toBe("erro_de_exemplo");
    expect(erro.name).toBe("ErroDeExemplo");
    expect(erro.message).toBe("falhou");
  });
});
