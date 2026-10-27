import { describe, expect, it } from "vitest";
import {
  AgendamentoCancelado,
  AgendamentoCriado,
  AgendamentoRemarcado,
  AtendimentoConcluido,
  EstabelecimentoCriado,
  EstabelecimentoId,
  Instante,
  NOMES_DOS_EVENTOS_DE_NEGOCIO,
} from "../../src/index";

const uuid = (n: number): string => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const est = EstabelecimentoId.de(uuid(1));
const quando = Instante.deIso("2026-10-27T12:00:00Z");

describe("catalogo de eventos de negocio", () => {
  it("agendamento_criado leva ids, inicio, canal e preco, sem dado pessoal", () => {
    const e = new AgendamentoCriado({
      estabelecimentoId: est,
      ocorridoEm: quando,
      agendamentoId: uuid(2),
      servicoId: uuid(3),
      profissionalId: uuid(4),
      inicio: Instante.deIso("2026-10-27T15:00:00Z"),
      canal: "app",
      precoCentavos: 4500,
    });
    expect(e.nome).toBe("agendamento_criado");
    expect(e.estabelecimentoId).toBe(est);
    expect(e.ocorridoEm).toBe(quando);
    expect(e.propriedades).toEqual({
      agendamento_id: uuid(2),
      servico_id: uuid(3),
      profissional_id: uuid(4),
      inicio: "2026-10-27T15:00:00.000Z",
      canal: "app",
      preco_centavos: 4500,
    });
  });

  it("agendamento_cancelado leva quem cancelou, antecedencia e se estava na politica", () => {
    const e = new AgendamentoCancelado({
      estabelecimentoId: est,
      ocorridoEm: quando,
      agendamentoId: uuid(2),
      quemCancelou: "cliente_final",
      antecedenciaMinutos: 180,
      dentroDaPolitica: true,
    });
    expect(e.nome).toBe("agendamento_cancelado");
    expect(e.propriedades).toEqual({
      agendamento_id: uuid(2),
      quem_cancelou: "cliente_final",
      antecedencia_min: 180,
      dentro_da_politica: true,
    });
  });

  it("agendamento_remarcado leva o inicio antigo e o novo", () => {
    const e = new AgendamentoRemarcado({
      estabelecimentoId: est,
      ocorridoEm: quando,
      agendamentoId: uuid(2),
      inicioAntigo: Instante.deIso("2026-10-27T15:00:00Z"),
      inicioNovo: Instante.deIso("2026-10-27T17:00:00Z"),
    });
    expect(e.nome).toBe("agendamento_remarcado");
    expect(e.propriedades["inicio_antigo"]).toBe("2026-10-27T15:00:00.000Z");
    expect(e.propriedades["inicio_novo"]).toBe("2026-10-27T17:00:00.000Z");
  });

  it("atendimento_concluido leva valor e duracao real", () => {
    const e = new AtendimentoConcluido({
      estabelecimentoId: est,
      ocorridoEm: quando,
      agendamentoId: uuid(2),
      valorCentavos: 4500,
      duracaoRealMinutos: 35,
    });
    expect(e.nome).toBe("atendimento_concluido");
    expect(e.propriedades).toEqual({
      agendamento_id: uuid(2),
      valor_centavos: 4500,
      duracao_real_min: 35,
    });
  });

  it("estabelecimento_criado leva vertical, modo de agenda e origem do lead (ou nulo)", () => {
    const e = new EstabelecimentoCriado({
      estabelecimentoId: est,
      ocorridoEm: quando,
      vertical: "barbearia",
      modoAgenda: "equipe",
      origemLeadId: null,
    });
    expect(e.nome).toBe("estabelecimento_criado");
    expect(e.propriedades).toEqual({
      vertical: "barbearia",
      modo_agenda: "equipe",
      origem_lead_id: null,
    });
  });

  it("os nomes do catalogo estao em snake_case no passado e sao unicos", () => {
    expect([...NOMES_DOS_EVENTOS_DE_NEGOCIO].sort()).toEqual([
      "agendamento_cancelado",
      "agendamento_criado",
      "agendamento_remarcado",
      "atendimento_concluido",
      "estabelecimento_criado",
    ]);
  });
});
