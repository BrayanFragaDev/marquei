import { describe, expect, it } from "vitest";
import {
  DiaCivil,
  EstabelecimentoId,
  EstabelecimentoNaoEncontradoError,
  Instante,
  ProfissionalId,
  ProfissionalNaoEncontradoError,
  ProfissionalNaoExecutaServicoError,
  ServicoNaoEncontradoError,
} from "@marquei/dominio";
import {
  BETO,
  CLIENTE_1,
  ESTAB_A,
  ESTAB_B,
  JOAO,
  PROFISSIONAL_DE_B,
  SERVICO_BARBA,
  SERVICO_CORTE,
  SERVICO_DE_B,
  SERVICO_INATIVO,
  TERCA,
  montarCenario,
  uuid,
} from "./suporte";

const dia = DiaCivil.deTexto(TERCA);

describe("ConsultarHorariosLivres", () => {
  it("sem profissional, agrega todos que executam o servico, em ordem de horario", async () => {
    const { consultar } = montarCenario();
    const r = await consultar.execute({
      estabelecimentoId: ESTAB_A,
      servicoId: SERVICO_CORTE,
      profissionalId: null,
      dia,
    });
    expect(r.fusoHorario).toBe("America/Sao_Paulo");
    expect(r.horarios).toHaveLength(12);
    expect(new Set(r.horarios.map((h) => h.profissionalId.valor))).toEqual(
      new Set([JOAO.valor, BETO.valor]),
    );
    expect(r.horarios[0]?.inicio.paraIso()).toBe("2026-10-27T12:00:00.000Z");
  });

  it("com profissional, devolve so os horarios dele", async () => {
    const { consultar } = montarCenario();
    const r = await consultar.execute({
      estabelecimentoId: ESTAB_A,
      servicoId: SERVICO_CORTE,
      profissionalId: BETO,
      dia,
    });
    expect(r.horarios).toHaveLength(6);
    expect(r.horarios.every((h) => h.profissionalId.igual(BETO))).toBe(true);
  });

  it("so oferece profissionais habilitados no servico", async () => {
    const { consultar } = montarCenario();
    const r = await consultar.execute({
      estabelecimentoId: ESTAB_A,
      servicoId: SERVICO_BARBA,
      profissionalId: null,
      dia,
    });
    expect(r.horarios.every((h) => h.profissionalId.igual(BETO))).toBe(true);
  });

  it("profissional que nao executa o servico pedido e recusado", async () => {
    const { consultar } = montarCenario();
    await expect(
      consultar.execute({
        estabelecimentoId: ESTAB_A,
        servicoId: SERVICO_BARBA,
        profissionalId: JOAO,
        dia,
      }),
    ).rejects.toBeInstanceOf(ProfissionalNaoExecutaServicoError);
  });

  it("servico inativo ou inexistente nao tem horarios", async () => {
    const { consultar } = montarCenario();
    for (const servicoId of [SERVICO_INATIVO]) {
      await expect(
        consultar.execute({ estabelecimentoId: ESTAB_A, servicoId, profissionalId: null, dia }),
      ).rejects.toBeInstanceOf(ServicoNaoEncontradoError);
    }
  });

  it("profissional inexistente e recusado", async () => {
    const { consultar } = montarCenario();
    await expect(
      consultar.execute({
        estabelecimentoId: ESTAB_A,
        servicoId: SERVICO_CORTE,
        profissionalId: ProfissionalId.de(uuid(99)),
        dia,
      }),
    ).rejects.toBeInstanceOf(ProfissionalNaoEncontradoError);
  });

  it("isolamento: servico e profissional de outro estabelecimento nao existem", async () => {
    const { consultar } = montarCenario();
    await expect(
      consultar.execute({
        estabelecimentoId: ESTAB_A,
        servicoId: SERVICO_DE_B,
        profissionalId: null,
        dia,
      }),
    ).rejects.toBeInstanceOf(ServicoNaoEncontradoError);
    await expect(
      consultar.execute({
        estabelecimentoId: ESTAB_A,
        servicoId: SERVICO_CORTE,
        profissionalId: PROFISSIONAL_DE_B,
        dia,
      }),
    ).rejects.toBeInstanceOf(ProfissionalNaoEncontradoError);
  });

  it("estabelecimento inexistente falha com erro de dominio", async () => {
    const { consultar } = montarCenario();
    await expect(
      consultar.execute({
        estabelecimentoId: EstabelecimentoId.de(uuid(77)),
        servicoId: SERVICO_CORTE,
        profissionalId: null,
        dia,
      }),
    ).rejects.toBeInstanceOf(EstabelecimentoNaoEncontradoError);
  });

  it("um horario reservado deixa de ser oferecido (com o intervalo do servico)", async () => {
    const { consultar, criar } = montarCenario();
    await criar.execute({
      estabelecimentoId: ESTAB_A,
      clienteId: CLIENTE_1,
      servicoId: SERVICO_CORTE,
      profissionalId: JOAO,
      inicio: Instante.deIso("2026-10-27T13:00:00Z"),
      canal: "app",
    });
    const r = await consultar.execute({
      estabelecimentoId: ESTAB_A,
      servicoId: SERVICO_CORTE,
      profissionalId: JOAO,
      dia,
    });
    // Corte tem 10 min de intervalo: o atendimento das 10:00 ocupa o profissional ate 10:40.
    // Fica de fora 09:30 (invadiria as 10:00), 10:00 e 10:30 (comecaria antes das 10:40).
    const inicios = r.horarios.map((h) => h.inicio.paraIso());
    expect(inicios).toEqual([
      "2026-10-27T12:00:00.000Z",
      "2026-10-27T14:00:00.000Z",
      "2026-10-27T14:30:00.000Z",
    ]);
  });

  it("o outro estabelecimento nao e afetado pela reserva", async () => {
    const { consultar, criar } = montarCenario();
    await criar.execute({
      estabelecimentoId: ESTAB_A,
      clienteId: CLIENTE_1,
      servicoId: SERVICO_CORTE,
      profissionalId: JOAO,
      inicio: Instante.deIso("2026-10-27T13:00:00Z"),
      canal: "app",
    });
    const r = await consultar.execute({
      estabelecimentoId: ESTAB_B,
      servicoId: SERVICO_DE_B,
      profissionalId: null,
      dia,
    });
    expect(r.horarios).toHaveLength(6);
  });
});
