import { describe, expect, it } from "vitest";
import { FabricaDeCenarios } from "./fabrica-de-cenarios.js";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("FabricaDeCenarios", () => {
  it("gera exatamente os mesmos dados a cada chamada", () => {
    const primeira = new FabricaDeCenarios();
    const segunda = new FabricaDeCenarios();
    expect(JSON.stringify(primeira.estabelecimentoA())).toBe(
      JSON.stringify(segunda.estabelecimentoA()),
    );
    expect(JSON.stringify(primeira.estabelecimentoB())).toBe(
      JSON.stringify(segunda.estabelecimentoB()),
    );
  });

  it("nunca compartilha ids entre o estabelecimento A e o B", () => {
    const fabrica = new FabricaDeCenarios();
    const idsA = new Set(fabrica.estabelecimentoA().ids());
    const idsB = fabrica.estabelecimentoB().ids();
    expect(idsB.filter((id) => idsA.has(id))).toEqual([]);
  });

  it("gera ids unicos dentro de cada cenario e no formato de UUID", () => {
    const fabrica = new FabricaDeCenarios();
    for (const cenario of [fabrica.estabelecimentoA(), fabrica.estabelecimentoB()]) {
      expect(new Set(cenario.ids()).size).toBe(cenario.ids().length);
      for (const id of cenario.ids()) expect(id).toMatch(UUID);
    }
  });

  it("vincula servico, profissional e cliente ao proprio estabelecimento", () => {
    const fabrica = new FabricaDeCenarios();
    for (const c of [fabrica.estabelecimentoA(), fabrica.estabelecimentoB()]) {
      expect(c.servico.estabelecimentoId).toBe(c.estabelecimento.id);
      expect(c.profissional.estabelecimentoId).toBe(c.estabelecimento.id);
      expect(c.cliente.estabelecimentoId).toBe(c.estabelecimento.id);
    }
  });
});
