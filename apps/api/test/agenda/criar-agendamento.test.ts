import { describe, expect, it } from "vitest";
import {
  AgendamentoNoPassadoError,
  HorarioIndisponivelError,
  Instante,
  ProfissionalNaoExecutaServicoError,
  ServicoNaoEncontradoError,
  StatusAgendamento,
} from "@marquei/dominio";
import {
  BETO,
  CLIENTE_1,
  CLIENTE_2,
  ESTAB_A,
  ESTAB_B,
  JOAO,
  SERVICO_BARBA,
  SERVICO_CORTE,
  SERVICO_DE_B,
  montarCenario,
} from "./suporte";

const pedido = (
  extra: Partial<Parameters<ReturnType<typeof montarCenario>["criar"]["execute"]>[0]> = {},
) => ({
  estabelecimentoId: ESTAB_A,
  clienteId: CLIENTE_1,
  servicoId: SERVICO_CORTE,
  profissionalId: JOAO,
  inicio: Instante.deIso("2026-10-27T13:00:00Z"),
  canal: "app" as const,
  ...extra,
});

describe("CriarAgendamento", () => {
  it("confirma em horario livre, copiando preco e intervalo do servico", async () => {
    const { criar, agendamentos } = montarCenario();
    const a = await criar.execute(pedido());
    expect(a.status).toBe(StatusAgendamento.Confirmado);
    expect(a.janela.fim.paraIso()).toBe("2026-10-27T13:30:00.000Z");
    expect(a.preco.centavos).toBe(4500);
    expect(a.intervaloAposMinutos).toBe(10);
    expect(agendamentos.todos()).toHaveLength(1);
  });

  it("publica agendamento_criado com ids e preco, sem dado pessoal", async () => {
    const { criar, eventos } = montarCenario();
    const a = await criar.execute(pedido());
    expect(eventos.publicados).toHaveLength(1);
    const e = eventos.publicados[0];
    expect(e?.nome).toBe("agendamento_criado");
    expect(e?.estabelecimentoId).toBe(ESTAB_A);
    expect(e?.propriedades).toEqual({
      agendamento_id: a.id.valor,
      servico_id: SERVICO_CORTE.valor,
      profissional_id: JOAO.valor,
      inicio: "2026-10-27T13:00:00.000Z",
      canal: "app",
      preco_centavos: 4500,
    });
  });

  it("recusa horario ocupado e nao publica evento", async () => {
    const { criar, eventos } = montarCenario();
    await criar.execute(pedido());
    eventos.publicados.length = 0;
    await expect(criar.execute(pedido({ clienteId: CLIENTE_2 }))).rejects.toBeInstanceOf(
      HorarioIndisponivelError,
    );
    expect(eventos.publicados).toEqual([]);
  });

  it("recusa horario que viola o intervalo do atendimento anterior", async () => {
    const { criar } = montarCenario();
    await criar.execute(pedido()); // 10:00-10:30 local; o profissional so fica livre as 10:40
    for (const iso of ["2026-10-27T13:30:00Z", "2026-10-27T12:30:00Z"]) {
      await expect(
        criar.execute(pedido({ inicio: Instante.deIso(iso), clienteId: CLIENTE_2 })),
      ).rejects.toBeInstanceOf(HorarioIndisponivelError);
    }
    await expect(
      criar.execute(
        pedido({ inicio: Instante.deIso("2026-10-27T14:00:00Z"), clienteId: CLIENTE_2 }),
      ),
    ).resolves.toBeDefined();
  });

  it("recusa horario fora do expediente ou fora do passo", async () => {
    const { criar } = montarCenario();
    for (const iso of ["2026-10-27T11:00:00Z", "2026-10-27T13:10:00Z", "2026-10-28T20:00:00Z"]) {
      await expect(criar.execute(pedido({ inicio: Instante.deIso(iso) }))).rejects.toBeInstanceOf(
        HorarioIndisponivelError,
      );
    }
  });

  it("recusa horario no passado com erro proprio", async () => {
    const { criar } = montarCenario();
    await expect(
      criar.execute(pedido({ inicio: Instante.deIso("2026-10-26T11:00:00Z") })),
    ).rejects.toBeInstanceOf(AgendamentoNoPassadoError);
  });

  it("dois pedidos simultaneos para o mesmo horario: um confirma e o outro recebe indisponivel", async () => {
    const { criar, agendamentos } = montarCenario();
    const resultados = await Promise.allSettled([
      criar.execute(pedido({ clienteId: CLIENTE_1 })),
      criar.execute(pedido({ clienteId: CLIENTE_2 })),
    ]);
    expect(resultados.filter((r) => r.status === "fulfilled")).toHaveLength(1);
    const rejeitado = resultados.find((r) => r.status === "rejected");
    expect(rejeitado?.status === "rejected" && rejeitado.reason).toBeInstanceOf(
      HorarioIndisponivelError,
    );
    expect(agendamentos.todos()).toHaveLength(1);
  });

  it("o mesmo horario com profissionais diferentes e permitido", async () => {
    const { criar } = montarCenario();
    await criar.execute(pedido({ profissionalId: JOAO }));
    await expect(
      criar.execute(pedido({ profissionalId: BETO, clienteId: CLIENTE_2 })),
    ).resolves.toBeDefined();
  });

  it("profissional que nao executa o servico e recusado", async () => {
    const { criar } = montarCenario();
    await expect(
      criar.execute(pedido({ servicoId: SERVICO_BARBA, profissionalId: JOAO })),
    ).rejects.toBeInstanceOf(ProfissionalNaoExecutaServicoError);
  });

  it("isolamento: nao agenda servico de outro estabelecimento", async () => {
    const { criar } = montarCenario();
    await expect(criar.execute(pedido({ servicoId: SERVICO_DE_B }))).rejects.toBeInstanceOf(
      ServicoNaoEncontradoError,
    );
    await expect(
      criar.execute(pedido({ estabelecimentoId: ESTAB_B, servicoId: SERVICO_CORTE })),
    ).rejects.toBeInstanceOf(ServicoNaoEncontradoError);
  });
});
