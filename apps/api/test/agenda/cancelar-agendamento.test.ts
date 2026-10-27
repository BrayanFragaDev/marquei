import { describe, expect, it } from "vitest";
import {
  AgendamentoNaoCancelavelError,
  AgendamentoNaoEncontradoError,
  AtorDoAgendamento,
  ForaDoPrazoDeCancelamentoError,
  Instante,
  StatusAgendamento,
  type Agendamento,
} from "@marquei/dominio";
import {
  CLIENTE_1,
  CLIENTE_2,
  ESTAB_A,
  ESTAB_B,
  JOAO,
  SERVICO_CORTE,
  montarCenario,
  prestesAComecar,
} from "./suporte";

async function reservar(inicioIso: string) {
  const c = montarCenario();
  const agendamento: Agendamento = await c.criar.execute({
    estabelecimentoId: ESTAB_A,
    clienteId: CLIENTE_1,
    servicoId: SERVICO_CORTE,
    profissionalId: JOAO,
    inicio: Instante.deIso(inicioIso),
    canal: "app",
  });
  c.eventos.publicados.length = 0;
  return { ...c, agendamento };
}

describe("CancelarAgendamento", () => {
  it("o cliente cancela dentro do prazo e o evento diz quem, com quanta antecedencia", async () => {
    const { cancelar, agendamento, eventos } = await reservar("2026-10-27T13:00:00Z");
    const r = await cancelar.execute({
      estabelecimentoId: ESTAB_A,
      agendamentoId: agendamento.id,
      ator: AtorDoAgendamento.cliente(CLIENTE_1),
    });
    expect(r.status).toBe(StatusAgendamento.Cancelado);
    expect(eventos.publicados).toHaveLength(1);
    expect(eventos.publicados[0]?.nome).toBe("agendamento_cancelado");
    expect(eventos.publicados[0]?.propriedades).toEqual({
      agendamento_id: agendamento.id.valor,
      quem_cancelou: "cliente_final",
      antecedencia_min: 25 * 60,
      dentro_da_politica: true,
    });
  });

  it("o cliente nao cancela fora da antecedencia minima do estabelecimento", async () => {
    const c = montarCenario();
    const proximo = prestesAComecar();
    await c.agendamentos.salvar(proximo);
    await expect(
      c.cancelar.execute({
        estabelecimentoId: ESTAB_A,
        agendamentoId: proximo.id,
        ator: AtorDoAgendamento.cliente(CLIENTE_1),
      }),
    ).rejects.toBeInstanceOf(ForaDoPrazoDeCancelamentoError);
    expect(c.eventos.publicados).toEqual([]);
    expect((await c.agendamentos.obterPorId(ESTAB_A, proximo.id)).status).toBe(
      StatusAgendamento.Confirmado,
    );
  });

  it("outro cliente do mesmo estabelecimento nao encontra o agendamento", async () => {
    const { cancelar, agendamento } = await reservar("2026-10-27T13:00:00Z");
    await expect(
      cancelar.execute({
        estabelecimentoId: ESTAB_A,
        agendamentoId: agendamento.id,
        ator: AtorDoAgendamento.cliente(CLIENTE_2),
      }),
    ).rejects.toBeInstanceOf(AgendamentoNaoEncontradoError);
  });

  it("isolamento: outro estabelecimento nao encontra o agendamento", async () => {
    const { cancelar, agendamento } = await reservar("2026-10-27T13:00:00Z");
    await expect(
      cancelar.execute({
        estabelecimentoId: ESTAB_B,
        agendamentoId: agendamento.id,
        ator: AtorDoAgendamento.equipe("gestor"),
      }),
    ).rejects.toBeInstanceOf(AgendamentoNaoEncontradoError);
  });

  it("a equipe cancela mesmo sem antecedencia e o evento marca fora da politica", async () => {
    const c = montarCenario();
    const proximo = prestesAComecar();
    await c.agendamentos.salvar(proximo);
    await c.cancelar.execute({
      estabelecimentoId: ESTAB_A,
      agendamentoId: proximo.id,
      ator: AtorDoAgendamento.equipe("gestor"),
    });
    expect(c.eventos.publicados[0]?.propriedades).toEqual({
      agendamento_id: proximo.id.valor,
      quem_cancelou: "gestor",
      antecedencia_min: 90,
      dentro_da_politica: false,
    });
  });

  it("nao cancela duas vezes", async () => {
    const { cancelar, agendamento } = await reservar("2026-10-27T13:00:00Z");
    const entrada = {
      estabelecimentoId: ESTAB_A,
      agendamentoId: agendamento.id,
      ator: AtorDoAgendamento.cliente(CLIENTE_1),
    };
    await cancelar.execute(entrada);
    await expect(cancelar.execute(entrada)).rejects.toBeInstanceOf(AgendamentoNaoCancelavelError);
  });

  it("cancelar libera o horario para outro cliente", async () => {
    const { cancelar, criar, agendamento } = await reservar("2026-10-27T13:00:00Z");
    await cancelar.execute({
      estabelecimentoId: ESTAB_A,
      agendamentoId: agendamento.id,
      ator: AtorDoAgendamento.cliente(CLIENTE_1),
    });
    await expect(
      criar.execute({
        estabelecimentoId: ESTAB_A,
        clienteId: CLIENTE_2,
        servicoId: SERVICO_CORTE,
        profissionalId: JOAO,
        inicio: Instante.deIso("2026-10-27T13:00:00Z"),
        canal: "app",
      }),
    ).resolves.toBeDefined();
  });
});
