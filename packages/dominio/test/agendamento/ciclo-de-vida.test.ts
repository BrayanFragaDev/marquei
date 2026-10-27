import { describe, expect, it } from "vitest";
import {
  Agendamento,
  AgendamentoId,
  AgendamentoNaoCancelavelError,
  AgendamentoNaoConcluivelError,
  AgendamentoNaoEncontradoError,
  AgendamentoNaoRemarcavelError,
  AgendamentoNoPassadoError,
  AtorDoAgendamento,
  ClienteFinalId,
  Dinheiro,
  EstabelecimentoId,
  ForaDoPrazoDeCancelamentoError,
  Instante,
  JanelaDeTempo,
  PoliticaDeCancelamentoPorAntecedencia,
  ProfissionalId,
  ServicoId,
  StatusAgendamento,
} from "../../src/index";

const uuid = (n: number): string => `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;
const agora = Instante.deIso("2026-10-27T12:00:00Z");
const duasHoras = PoliticaDeCancelamentoPorAntecedencia.deMinutos(120);
const DONA = ClienteFinalId.de(uuid(5));
const OUTRA = ClienteFinalId.de(uuid(6));

function confirmado(inicioIso = "2026-10-27T15:00:00Z", minutos = 30, intervalo = 10): Agendamento {
  return Agendamento.criar(
    {
      id: AgendamentoId.de(uuid(1)),
      estabelecimentoId: EstabelecimentoId.de(uuid(2)),
      servicoId: ServicoId.de(uuid(3)),
      profissionalId: ProfissionalId.de(uuid(4)),
      clienteId: DONA,
      janela: JanelaDeTempo.comDuracao(Instante.deIso(inicioIso), minutos),
      preco: Dinheiro.deCentavos(4500),
      intervaloAposMinutos: intervalo,
    },
    agora,
  );
}

describe("Agendamento: janela ocupada", () => {
  it("inclui o intervalo apos o atendimento, sem alterar o fim do atendimento", () => {
    const a = confirmado();
    expect(a.janela.fim.paraIso()).toBe("2026-10-27T15:30:00.000Z");
    expect(a.janelaOcupada().fim.paraIso()).toBe("2026-10-27T15:40:00.000Z");
  });

  it("agendamento cancelado nao ocupa horario", () => {
    const cancelado = confirmado().cancelarPor(AtorDoAgendamento.cliente(DONA), agora, duasHoras);
    expect(cancelado.ocupaHorario()).toBe(false);
  });
});

describe("Agendamento: cancelamento por ator", () => {
  it("o proprio cliente cancela dentro da politica", () => {
    const c = confirmado().cancelarPor(AtorDoAgendamento.cliente(DONA), agora, duasHoras);
    expect(c.status).toBe(StatusAgendamento.Cancelado);
  });

  it("o proprio cliente nao cancela fora do prazo", () => {
    expect(() =>
      confirmado("2026-10-27T13:00:00Z").cancelarPor(
        AtorDoAgendamento.cliente(DONA),
        agora,
        duasHoras,
      ),
    ).toThrow(ForaDoPrazoDeCancelamentoError);
  });

  it("outro cliente enxerga o agendamento como inexistente", () => {
    expect(() =>
      confirmado().cancelarPor(AtorDoAgendamento.cliente(OUTRA), agora, duasHoras),
    ).toThrow(AgendamentoNaoEncontradoError);
  });

  it("a equipe cancela mesmo fora do prazo, que vale so para o cliente", () => {
    const c = confirmado("2026-10-27T12:30:00Z").cancelarPor(
      AtorDoAgendamento.equipe("gestor"),
      agora,
      duasHoras,
    );
    expect(c.status).toBe(StatusAgendamento.Cancelado);
  });

  it("nao cancela duas vezes, nem a equipe", () => {
    const c = confirmado().cancelarPor(AtorDoAgendamento.equipe("gestor"), agora, duasHoras);
    expect(() => c.cancelarPor(AtorDoAgendamento.equipe("gestor"), agora, duasHoras)).toThrow(
      AgendamentoNaoCancelavelError,
    );
  });

  it("informa quem cancelou e se estava dentro da politica", () => {
    const a = confirmado("2026-10-27T12:30:00Z");
    expect(AtorDoAgendamento.cliente(DONA).tipo).toBe("cliente_final");
    expect(AtorDoAgendamento.equipe("profissional").tipo).toBe("profissional");
    expect(a.dentroDaPolitica(agora, duasHoras)).toBe(false);
    expect(a.antecedenciaEmMinutos(agora)).toBe(30);
  });
});

describe("Agendamento: concluir", () => {
  it("conclui depois que o atendimento comecou, devolvendo nova instancia", () => {
    const original = confirmado();
    const concluido = original.concluir(Instante.deIso("2026-10-27T15:10:00Z"));
    expect(concluido.status).toBe(StatusAgendamento.Concluido);
    expect(original.status).toBe(StatusAgendamento.Confirmado);
    expect(concluido.ocupaHorario()).toBe(false);
  });

  it("nao conclui atendimento que ainda nao comecou", () => {
    expect(() => confirmado().concluir(agora)).toThrow(AgendamentoNaoConcluivelError);
  });

  it("nao conclui agendamento cancelado nem ja concluido", () => {
    const depois = Instante.deIso("2026-10-27T16:00:00Z");
    const cancelado = confirmado().cancelarPor(
      AtorDoAgendamento.equipe("gestor"),
      agora,
      duasHoras,
    );
    expect(() => cancelado.concluir(depois)).toThrow(AgendamentoNaoConcluivelError);
    expect(() => confirmado().concluir(depois).concluir(depois)).toThrow(
      AgendamentoNaoConcluivelError,
    );
  });

  it("calcula a duracao real em minutos entre o inicio previsto e o momento da conclusao", () => {
    const concluido = confirmado().concluir(Instante.deIso("2026-10-27T15:45:00Z"));
    expect(concluido.duracaoRealAte(Instante.deIso("2026-10-27T15:45:00Z"))).toBe(45);
  });
});

describe("Agendamento: remarcar", () => {
  const novoInicio = Instante.deIso("2026-10-27T17:00:00Z");

  it("move o atendimento mantendo duracao, intervalo, id e preco", () => {
    const r = confirmado().remarcarPara(novoInicio, agora, duasHoras);
    expect(r.id.valor).toBe(uuid(1));
    expect(r.janela.inicio.paraIso()).toBe("2026-10-27T17:00:00.000Z");
    expect(r.janela.duracaoEmMinutos()).toBe(30);
    expect(r.janelaOcupada().duracaoEmMinutos()).toBe(40);
    expect(r.preco.centavos).toBe(4500);
    expect(r.status).toBe(StatusAgendamento.Confirmado);
  });

  it("nao altera a instancia original", () => {
    const original = confirmado();
    original.remarcarPara(novoInicio, agora, duasHoras);
    expect(original.janela.inicio.paraIso()).toBe("2026-10-27T15:00:00.000Z");
  });

  it("nao remarca para o passado", () => {
    expect(() =>
      confirmado().remarcarPara(Instante.deIso("2026-10-27T11:00:00Z"), agora, duasHoras),
    ).toThrow(AgendamentoNoPassadoError);
  });

  it("respeita a antecedencia minima sobre o horario ATUAL", () => {
    expect(() =>
      confirmado("2026-10-27T13:00:00Z").remarcarPara(novoInicio, agora, duasHoras),
    ).toThrow(ForaDoPrazoDeCancelamentoError);
  });

  it("so remarca agendamento confirmado", () => {
    const cancelado = confirmado().cancelarPor(
      AtorDoAgendamento.equipe("gestor"),
      agora,
      duasHoras,
    );
    expect(() => cancelado.remarcarPara(novoInicio, agora, duasHoras)).toThrow(
      AgendamentoNaoRemarcavelError,
    );
  });
});
