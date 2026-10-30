import { describe, expect, it } from "vitest";
import {
  AcaoNaoPermitidaError,
  ClienteFinalId,
  Papel,
  SolicitanteDeAgendamento,
  UsuarioId,
} from "../../src/index";

const uuid = (n: number): string => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const quem = UsuarioId.de(uuid(7));

describe("SolicitanteDeAgendamento", () => {
  it("o cliente final agenda para si mesmo e age como cliente", () => {
    const s = SolicitanteDeAgendamento.de(Papel.ClienteFinal, quem);
    expect(s.clienteQueAgenda().igual(ClienteFinalId.de(uuid(7)))).toBe(true);
    expect(s.ator().tipo).toBe("cliente_final");
    expect(s.ator().sujeitoAPolitica()).toBe(true);
  });

  it("dono e gestor cancelam como gestor; profissional como profissional; sem politica de prazo", () => {
    for (const [papel, tipo] of [
      [Papel.Dono, "gestor"],
      [Papel.Gestor, "gestor"],
      [Papel.Profissional, "profissional"],
    ] as const) {
      const ator = SolicitanteDeAgendamento.de(papel, quem).ator();
      expect(ator.tipo).toBe(tipo);
      expect(ator.sujeitoAPolitica()).toBe(false);
    }
  });

  it("a equipe nao agenda em nome proprio: criar agendamento exige o cliente final", () => {
    for (const papel of [Papel.Dono, Papel.Gestor, Papel.Profissional]) {
      expect(() => SolicitanteDeAgendamento.de(papel, quem).clienteQueAgenda()).toThrow(
        AcaoNaoPermitidaError,
      );
    }
  });

  it("o operador da plataforma nao age sobre agendamentos", () => {
    const s = SolicitanteDeAgendamento.de(Papel.OperadorPlataforma, quem);
    expect(() => s.ator()).toThrow(AcaoNaoPermitidaError);
    expect(() => s.clienteQueAgenda()).toThrow(AcaoNaoPermitidaError);
  });
});
