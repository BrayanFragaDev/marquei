import { describe, expect, it } from "vitest";
import { Audiencia, Papel, PapelInvalidoError } from "../../src/index";

describe("Papel", () => {
  it("reconhece os cinco papeis do produto", () => {
    expect(Papel.de("cliente_final")).toBe(Papel.ClienteFinal);
    expect(Papel.de("profissional")).toBe(Papel.Profissional);
    expect(Papel.de("gestor")).toBe(Papel.Gestor);
    expect(Papel.de("dono")).toBe(Papel.Dono);
    expect(Papel.de("operador_plataforma")).toBe(Papel.OperadorPlataforma);
  });

  it("recusa papel desconhecido", () => {
    expect(() => Papel.de("admin")).toThrow(PapelInvalidoError);
  });

  it("profissional, gestor e dono pertencem ao console do estabelecimento", () => {
    expect(Papel.Profissional.pertenceAoConsoleDoEstabelecimento()).toBe(true);
    expect(Papel.Gestor.pertenceAoConsoleDoEstabelecimento()).toBe(true);
    expect(Papel.Dono.pertenceAoConsoleDoEstabelecimento()).toBe(true);
    expect(Papel.ClienteFinal.pertenceAoConsoleDoEstabelecimento()).toBe(false);
    expect(Papel.OperadorPlataforma.pertenceAoConsoleDoEstabelecimento()).toBe(false);
  });

  it("somente o operador nao tem tenant", () => {
    expect(Papel.OperadorPlataforma.exigeTenant()).toBe(false);
    expect(Papel.Dono.exigeTenant()).toBe(true);
    expect(Papel.ClienteFinal.exigeTenant()).toBe(true);
  });

  it("cada papel tem uma unica audiencia", () => {
    expect(Papel.Dono.audiencia()).toBe(Audiencia.ConsoleEstabelecimento);
    expect(Papel.OperadorPlataforma.audiencia()).toBe(Audiencia.ConsolePlataforma);
    expect(Papel.ClienteFinal.audiencia()).toBe(Audiencia.AppCliente);
  });

  it("dono e gestor gerenciam o estabelecimento; profissional nao", () => {
    expect(Papel.Dono.gerenciaEstabelecimento()).toBe(true);
    expect(Papel.Gestor.gerenciaEstabelecimento()).toBe(true);
    expect(Papel.Profissional.gerenciaEstabelecimento()).toBe(false);
  });
});
