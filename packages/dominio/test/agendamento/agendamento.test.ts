import { describe, expect, it } from "vitest";
import {
  Agendamento,
  AgendamentoId,
  AgendamentoNaoCancelavelError,
  AgendamentoNoPassadoError,
  ClienteFinalId,
  EstabelecimentoId,
  ForaDoPrazoDeCancelamentoError,
  Instante,
  JanelaDeTempo,
  JanelaDeTempoInvalidaError,
  ProfissionalId,
  ServicoId,
  StatusAgendamento,
  type PoliticaDeCancelamento,
} from "../../src/index";

const agora = Instante.deIso("2026-10-27T12:00:00Z");
const umUuid = (n: number): string => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const aberta: PoliticaDeCancelamento = { permite: () => true };
const comAntecedencia: PoliticaDeCancelamento = {
  permite: (inicio, ref) => ref.minutosAte(inicio) >= 120,
};

function dados(inicioIso: string) {
  return {
    id: AgendamentoId.de(umUuid(1)),
    estabelecimentoId: EstabelecimentoId.de(umUuid(2)),
    servicoId: ServicoId.de(umUuid(3)),
    profissionalId: ProfissionalId.de(umUuid(4)),
    clienteId: ClienteFinalId.de(umUuid(5)),
    janela: JanelaDeTempo.comDuracao(Instante.deIso(inicioIso), 30),
  };
}

describe("JanelaDeTempo", () => {
  it("recusa janela que termina antes ou junto do inicio", () => {
    const t = Instante.deIso("2026-10-27T12:00:00Z");
    expect(() => JanelaDeTempo.criar(t, t)).toThrow(JanelaDeTempoInvalidaError);
  });

  it("janelas que apenas se tocam nao se sobrepoem", () => {
    const a = JanelaDeTempo.comDuracao(Instante.deIso("2026-10-27T12:00:00Z"), 30);
    const b = JanelaDeTempo.comDuracao(Instante.deIso("2026-10-27T12:30:00Z"), 30);
    const c = JanelaDeTempo.comDuracao(Instante.deIso("2026-10-27T12:29:00Z"), 30);
    expect(a.sobrepoe(b)).toBe(false);
    expect(a.sobrepoe(c)).toBe(true);
    expect(c.sobrepoe(a)).toBe(true);
    expect(a.duracaoEmMinutos()).toBe(30);
  });
});

describe("Agendamento", () => {
  it("nasce confirmado e ocupa o horario", () => {
    const a = Agendamento.criar(dados("2026-10-27T15:00:00Z"), agora);
    expect(a.status).toBe(StatusAgendamento.Confirmado);
    expect(a.ocupaHorario()).toBe(true);
  });

  it("nao pode ser criado no passado", () => {
    expect(() => Agendamento.criar(dados("2026-10-27T11:00:00Z"), agora)).toThrow(
      AgendamentoNoPassadoError,
    );
  });

  it("cancelar devolve nova instancia e libera o horario sem mutar a original", () => {
    const original = Agendamento.criar(dados("2026-10-27T15:00:00Z"), agora);
    const cancelado = original.cancelar(agora, aberta);
    expect(cancelado.status).toBe(StatusAgendamento.Cancelado);
    expect(cancelado.ocupaHorario()).toBe(false);
    expect(original.status).toBe(StatusAgendamento.Confirmado);
  });

  it("respeita a politica de cancelamento", () => {
    const a = Agendamento.criar(dados("2026-10-27T13:00:00Z"), agora);
    expect(() => a.cancelar(agora, comAntecedencia)).toThrow(ForaDoPrazoDeCancelamentoError);
  });

  it("nao cancela agendamento que ja nao esta confirmado", () => {
    const cancelado = Agendamento.criar(dados("2026-10-27T15:00:00Z"), agora).cancelar(
      agora,
      aberta,
    );
    expect(() => cancelado.cancelar(agora, aberta)).toThrow(AgendamentoNaoCancelavelError);
  });

  it("reconstituir nao revalida o passado", () => {
    const a = Agendamento.reconstituir(dados("2020-01-01T10:00:00Z"), StatusAgendamento.Concluido);
    expect(a.status).toBe(StatusAgendamento.Concluido);
  });
});
