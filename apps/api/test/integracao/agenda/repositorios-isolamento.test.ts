import type pg from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import {
  Agendamento,
  AgendamentoId,
  AgendamentoNaoEncontradoError,
  Bloqueio,
  BloqueioId,
  ClienteFinalId,
  Dinheiro,
  EstabelecimentoId,
  HorarioIndisponivelError,
  Instante,
  JanelaDeTempo,
  ProfissionalId,
  ServicoId,
  Slug,
  StatusAgendamento,
} from "@marquei/dominio";
import {
  ExecutorTransacional,
  ProvedorDeTransacao,
  SemTransacaoComTenantError,
} from "../../../src/nucleo";
import { AgendamentoRepositorioPostgres } from "../../../src/modulos/agenda/infra/agendamento-repositorio-postgres";
import { BloqueioRepositorioPostgres } from "../../../src/modulos/agenda/infra/bloqueio-repositorio-postgres";
import { HorarioDeTrabalhoRepositorioPostgres } from "../../../src/modulos/agenda/infra/horario-de-trabalho-repositorio-postgres";
import { EstabelecimentoPublicoRepositorioPostgres } from "../../../src/modulos/catalogo/infra/estabelecimento-publico-repositorio-postgres";
import { EstabelecimentoRepositorioPostgres } from "../../../src/modulos/catalogo/infra/estabelecimento-repositorio-postgres";
import { ProfissionalRepositorioPostgres } from "../../../src/modulos/catalogo/infra/profissional-repositorio-postgres";
import { ServicoRepositorioPostgres } from "../../../src/modulos/catalogo/infra/servico-repositorio-postgres";
import { comPapel, criarPoolAdmin } from "../suporte/banco";
import { criarTenant, removerTenant, type Tenant } from "../suporte/fixtures";
import { iso, limparAgenda, prepararAgenda } from "./suporte-agenda";

describe("repositorios de agenda e catalogo: isolamento entre tenants", () => {
  let pool: pg.Pool;
  let a: Tenant;
  let b: Tenant;
  let transacao: ProvedorDeTransacao;
  let executor: ExecutorTransacional;
  const idA = (): EstabelecimentoId => EstabelecimentoId.de(a.estabelecimentoId);
  const idB = (): EstabelecimentoId => EstabelecimentoId.de(b.estabelecimentoId);
  const noA = <T>(acao: () => Promise<T>): Promise<T> =>
    executor.executar({ papel: "app_usuario", tenant: idA() }, acao);
  const noB = <T>(acao: () => Promise<T>): Promise<T> =>
    executor.executar({ papel: "app_usuario", tenant: idB() }, acao);

  beforeAll(async () => {
    pool = criarPoolAdmin();
    a = await criarTenant(pool, "91");
    b = await criarTenant(pool, "92");
    await prepararAgenda(pool, a);
    await prepararAgenda(pool, b);
    transacao = new ProvedorDeTransacao();
    executor = new ExecutorTransacional(pool, transacao);
  });

  afterAll(async () => {
    await limparAgenda(pool, a.estabelecimentoId);
    await limparAgenda(pool, b.estabelecimentoId);
    await removerTenant(pool, a.estabelecimentoId);
    await removerTenant(pool, b.estabelecimentoId);
    await pool.end();
  });

  describe("catalogo", () => {
    it("servicos: cada tenant lista e le so os seus, mesmo pedindo o id do outro", async () => {
      const repo = new ServicoRepositorioPostgres(transacao);
      const lista = await noA(() => repo.listarAtivos(idA()));
      expect(lista.map((s) => s.id.valor)).toEqual([a.servicoId]);
      expect(lista[0]?.intervaloAposMinutos).toBe(10);
      const cruzado = await noA(async () => [
        await repo.obterPorId(idA(), ServicoId.de(b.servicoId)),
        await repo.obterPorId(idB(), ServicoId.de(b.servicoId)),
        await repo.listarAtivos(idB()),
      ]);
      expect(cruzado).toEqual([null, null, []]);
      expect((await noB(() => repo.obterPorId(idB(), ServicoId.de(b.servicoId))))?.id.valor).toBe(
        b.servicoId,
      );
    });

    it("servicos: nao lista servico inativo", async () => {
      const repo = new ServicoRepositorioPostgres(transacao);
      await pool.query("UPDATE servico SET ativo = false WHERE id = $1", [b.servicoId]);
      try {
        expect(await noB(() => repo.listarAtivos(idB()))).toEqual([]);
      } finally {
        await pool.query("UPDATE servico SET ativo = true WHERE id = $1", [b.servicoId]);
      }
    });

    it("profissionais: reconstitui os servicos habilitados e nao vaza entre tenants", async () => {
      const repo = new ProfissionalRepositorioPostgres(transacao);
      const doA = await noA(() => repo.obterPorId(idA(), ProfissionalId.de(a.profissionalId)));
      expect(doA?.servicosIds.map((s) => s.valor)).toEqual([a.servicoId]);
      const cruzado = await noA(async () => [
        await repo.obterPorId(idA(), ProfissionalId.de(b.profissionalId)),
        await repo.obterPorId(idB(), ProfissionalId.de(b.profissionalId)),
        await repo.listarAtivos(idB()),
        await repo.listarQueExecutam(idB(), ServicoId.de(b.servicoId)),
      ]);
      expect(cruzado).toEqual([null, null, [], []]);
      const executam = await noA(() => repo.listarQueExecutam(idA(), ServicoId.de(a.servicoId)));
      expect(executam.map((p) => p.id.valor)).toEqual([a.profissionalId]);
      const semHabilitacao = await noA(() =>
        repo.listarQueExecutam(idA(), ServicoId.de(b.servicoId)),
      );
      expect(semHabilitacao).toEqual([]);
    });

    it("estabelecimento: le a configuracao do proprio tenant e nao enxerga o outro", async () => {
      const repo = new EstabelecimentoRepositorioPostgres(transacao);
      const proprio = await noA(() => repo.obterPorId(idA()));
      expect(proprio?.passoDaAgendaMinutos).toBe(15);
      expect(proprio?.antecedenciaDeCancelamentoMinutos).toBe(120);
      expect(proprio?.fusoHorario).toBe("America/Sao_Paulo");
      expect(proprio?.vertical).toBe("barbearia");
      expect(await noA(() => repo.obterPorId(idB()))).toBeNull();
    });

    it("vitrine publica: so a projecao publica e so o tema publicado, nunca o rascunho", async () => {
      const repo = new EstabelecimentoPublicoRepositorioPostgres(executor, transacao);
      await pool.query(
        `INSERT INTO tema (estabelecimento_id, estado, tokens) VALUES ($1, 'rascunho', '{"cor":"segredo-rascunho"}')`,
        [a.estabelecimentoId],
      );
      const semPublicado = await repo.obterPorSlug(Slug.de("teste-91"));
      expect(semPublicado?.tema).toBeNull();
      expect(JSON.stringify(semPublicado)).not.toContain("segredo-rascunho");
      await pool.query(
        `INSERT INTO tema (estabelecimento_id, estado, tokens) VALUES ($1, 'publicado', '{"cor":"azul"}')`,
        [a.estabelecimentoId],
      );
      const comPublicado = await repo.obterPorSlug(Slug.de("teste-91"));
      expect(comPublicado?.tema).toEqual({ versao: 1, tokens: { cor: "azul" } });
      await pool.query(
        `INSERT INTO evento_analitico (estabelecimento_id, nome, ocorrido_em)
         VALUES ($1, 'tema_publicado', now()), ($1, 'tema_publicado', now())`,
        [a.estabelecimentoId],
      );
      expect((await repo.obterPorSlug(Slug.de("teste-91")))?.tema?.versao).toBe(2);
      expect(comPublicado?.vocabulario["profissional"]).toBe("barbeiro");
      expect(Object.keys(comPublicado ?? {}).sort()).toEqual(
        ["fusoHorario", "id", "nome", "slug", "tema", "vertical", "vocabulario"].sort(),
      );
      expect((await repo.obterPorSlug(Slug.de("teste-92")))?.tema).toBeNull();
      expect(await repo.obterPorSlug(Slug.de("nao-existe-91"))).toBeNull();
    });
  });

  describe("agenda", () => {
    it("horarios de trabalho: cada tenant le so os do proprio profissional", async () => {
      const repo = new HorarioDeTrabalhoRepositorioPostgres(transacao);
      const proprios = await noA(() =>
        repo.doProfissional(idA(), ProfissionalId.de(a.profissionalId)),
      );
      expect(proprios).toHaveLength(1);
      expect(proprios[0]).toMatchObject({ diaDaSemana: 2, inicioMinutos: 540, fimMinutos: 720 });
      const cruzado = await noA(async () => [
        await repo.doProfissional(idA(), ProfissionalId.de(b.profissionalId)),
        await repo.doProfissional(idB(), ProfissionalId.de(b.profissionalId)),
      ]);
      expect(cruzado).toEqual([[], []]);
    });

    it("bloqueios: traz os do profissional e os gerais do proprio tenant, nunca os do outro", async () => {
      const repo = new BloqueioRepositorioPostgres(transacao);
      await pool.query(
        `INSERT INTO bloqueio (estabelecimento_id, profissional_id, inicio, fim, motivo) VALUES
           ($1, $2, '2030-01-15T13:00:00Z', '2030-01-15T14:00:00Z', 'reuniao'),
           ($1, NULL, '2030-01-15T15:00:00Z', '2030-01-15T16:00:00Z', 'feriado'),
           ($3, $4, '2030-01-15T13:00:00Z', '2030-01-15T14:00:00Z', 'do outro tenant')`,
        [a.estabelecimentoId, a.profissionalId, b.estabelecimentoId, b.profissionalId],
      );
      const dia = JanelaDeTempo.criar(
        Instante.deIso("2030-01-15T03:00:00Z"),
        Instante.deIso("2030-01-16T03:00:00Z"),
      );
      const doA = await noA(() =>
        repo.doProfissional(idA(), ProfissionalId.de(a.profissionalId), dia),
      );
      expect(doA.map((x: Bloqueio) => x.motivo)).toEqual(["reuniao", "feriado"]);
      expect(doA[1]?.profissionalId).toBeNull();
      expect(doA[0]?.id).toBeInstanceOf(Object);
      expect(BloqueioId.de(doA[0]?.id.valor ?? "")).toBeDefined();
      const cruzado = await noA(async () => [
        await repo.doProfissional(idA(), ProfissionalId.de(b.profissionalId), dia),
        await repo.doProfissional(idB(), ProfissionalId.de(b.profissionalId), dia),
      ]);
      // Pedir o profissional de B no tenant A so devolve os bloqueios GERAIS de A.
      expect(cruzado[0]?.map((x) => x.motivo)).toEqual(["feriado"]);
      expect(cruzado[1]).toEqual([]);
      const doB = await noB(() =>
        repo.doProfissional(idB(), ProfissionalId.de(b.profissionalId), dia),
      );
      expect(doB.map((x) => x.motivo)).toEqual(["do outro tenant"]);
    });

    const novo = (t: Tenant, id: string, inicio: string, intervalo = 0): Agendamento =>
      Agendamento.reconstituir(
        {
          id: AgendamentoId.de(id),
          estabelecimentoId: EstabelecimentoId.de(t.estabelecimentoId),
          servicoId: ServicoId.de(t.servicoId),
          profissionalId: ProfissionalId.de(t.profissionalId),
          clienteId: ClienteFinalId.de(t.clienteId),
          janela: JanelaDeTempo.comDuracao(Instante.deIso(inicio), 30),
          preco: Dinheiro.deCentavos(4500),
          intervaloAposMinutos: intervalo,
        },
        StatusAgendamento.Confirmado,
      );
    const ID_1 = "10000000-0000-4000-8000-000000000001";
    const ID_2 = "10000000-0000-4000-8000-000000000002";
    const ID_3 = "10000000-0000-4000-8000-000000000003";

    it("agendamentos: grava, le de volta com preco e intervalo e lista os ocupantes da janela", async () => {
      const repo = new AgendamentoRepositorioPostgres(transacao);
      await noA(() => repo.salvar(novo(a, ID_1, iso(13), 10)));
      const lido = await noA(() => repo.obterPorId(idA(), AgendamentoId.de(ID_1)));
      expect(lido.preco.centavos).toBe(4500);
      expect(lido.intervaloAposMinutos).toBe(10);
      expect(lido.janelaOcupada().fim.paraIso()).toBe(iso(13, 40));
      const dia = JanelaDeTempo.criar(Instante.deIso(iso(0)), Instante.deIso(iso(23)));
      const ocupantes = await noA(() =>
        repo.listarOcupantes(idA(), ProfissionalId.de(a.profissionalId), dia),
      );
      expect(ocupantes.map((o) => o.id.valor)).toEqual([ID_1]);
    });

    it("agendamentos: tenant A nao le, lista nem altera o agendamento do tenant B", async () => {
      const repo = new AgendamentoRepositorioPostgres(transacao);
      await noB(() => repo.salvar(novo(b, ID_2, iso(14))));
      await expect(
        noA(() => repo.obterPorId(idA(), AgendamentoId.de(ID_2))),
      ).rejects.toBeInstanceOf(AgendamentoNaoEncontradoError);
      await expect(
        noA(() => repo.obterPorId(idB(), AgendamentoId.de(ID_2))),
      ).rejects.toBeInstanceOf(AgendamentoNaoEncontradoError);
      const dia = JanelaDeTempo.criar(Instante.deIso(iso(0)), Instante.deIso(iso(23)));
      expect(
        await noA(() => repo.listarOcupantes(idB(), ProfissionalId.de(b.profissionalId), dia)),
      ).toEqual([]);
      // Tentativa de sobrescrever a linha do B (mesmo id) estando no A: nada muda.
      const sobrescrita = novo(a, ID_2, iso(15));
      await expect(noA(() => repo.salvar(sobrescrita))).rejects.toBeInstanceOf(
        AgendamentoNaoEncontradoError,
      );
      const intacto = await pool.query<{ status: string; inicio: Date }>(
        "SELECT status, inicio FROM agendamento WHERE id = $1",
        [ID_2],
      );
      expect(intacto.rows[0]?.status).toBe("confirmado");
      expect(intacto.rows[0]?.inicio.toISOString()).toBe(iso(14));
    });

    it("agendamentos: gravar com o estabelecimento de outro tenant e barrado pela RLS", async () => {
      const repo = new AgendamentoRepositorioPostgres(transacao);
      await expect(noA(() => repo.salvar(novo(b, ID_3, iso(11))))).rejects.toThrow(
        /row-level security/,
      );
      const r = await pool.query("SELECT 1 FROM agendamento WHERE id = $1", [ID_3]);
      expect(r.rowCount).toBe(0);
    });

    it("agendamentos: cancelar via repositorio libera o horario", async () => {
      const repo = new AgendamentoRepositorioPostgres(transacao);
      const cancelado = (await noA(() => repo.obterPorId(idA(), AgendamentoId.de(ID_1)))).cancelar(
        Instante.deIso("2030-01-01T00:00:00Z"),
        { permite: () => true },
      );
      await noA(() => repo.salvar(cancelado));
      const dia = JanelaDeTempo.criar(Instante.deIso(iso(0)), Instante.deIso(iso(23)));
      expect(
        await noA(() => repo.listarOcupantes(idA(), ProfissionalId.de(a.profissionalId), dia)),
      ).toEqual([]);
      await expect(noA(() => repo.salvar(novo(a, ID_3, iso(13))))).resolves.toBeUndefined();
    });

    it("fora de transacao com tenant, nenhum repositorio de agenda acessa o banco", async () => {
      const dia = JanelaDeTempo.criar(Instante.deIso(iso(0)), Instante.deIso(iso(23)));
      const profissional = ProfissionalId.de(a.profissionalId);
      await expect(
        new AgendamentoRepositorioPostgres(transacao).listarOcupantes(idA(), profissional, dia),
      ).rejects.toBeInstanceOf(SemTransacaoComTenantError);
      await expect(
        new BloqueioRepositorioPostgres(transacao).doProfissional(idA(), profissional, dia),
      ).rejects.toBeInstanceOf(SemTransacaoComTenantError);
      await expect(
        new HorarioDeTrabalhoRepositorioPostgres(transacao).doProfissional(idA(), profissional),
      ).rejects.toBeInstanceOf(SemTransacaoComTenantError);
    });
  });

  describe("concorrencia: a restricao de exclusao do banco e a ultima palavra", () => {
    const inicio = "2030-01-15T12:00:00.000Z";
    const tentar = (id: string, inicioIso: string, intervalo: number): Promise<void> => {
      const repo = new AgendamentoRepositorioPostgres(transacao);
      const agendamento = Agendamento.reconstituir(
        {
          id: AgendamentoId.de(id),
          estabelecimentoId: idA(),
          servicoId: ServicoId.de(a.servicoId),
          profissionalId: ProfissionalId.de(a.profissionalId),
          clienteId: ClienteFinalId.de(a.clienteId),
          janela: JanelaDeTempo.comDuracao(Instante.deIso(inicioIso), 30),
          preco: Dinheiro.deCentavos(4500),
          intervaloAposMinutos: intervalo,
        },
        StatusAgendamento.Confirmado,
      );
      return noA(async () => {
        await repo.salvar(agendamento);
        // Segura a transacao aberta para forcar a corrida real entre as duas.
        await new Promise((r) => setTimeout(r, 150));
      });
    };

    it("dois inserts simultaneos no mesmo horario: um grava, o outro recebe HorarioIndisponivelError", async () => {
      await pool.query("DELETE FROM agendamento WHERE profissional_id = $1 AND id <> $2", [
        a.profissionalId,
        a.agendamentoId,
      ]);
      const resultados = await Promise.allSettled([
        tentar("20000000-0000-4000-8000-000000000001", inicio, 0),
        tentar("20000000-0000-4000-8000-000000000002", inicio, 0),
      ]);
      expect(resultados.filter((r) => r.status === "fulfilled")).toHaveLength(1);
      const rejeitado = resultados.find((r) => r.status === "rejected");
      expect(rejeitado?.status === "rejected" && rejeitado.reason).toBeInstanceOf(
        HorarioIndisponivelError,
      );
      const r = await pool.query(
        "SELECT 1 FROM agendamento WHERE profissional_id = $1 AND inicio = $2 AND status = 'confirmado'",
        [a.profissionalId, inicio],
      );
      expect(r.rowCount).toBe(1);
    });

    it("o intervalo entre atendimentos tambem e protegido pelo banco", async () => {
      await tentar("20000000-0000-4000-8000-000000000003", "2030-01-15T14:00:00.000Z", 15);
      // Termina 14:30 e o profissional so fica livre 14:45: 14:35 e recusado, 14:45 e aceito.
      await expect(
        tentar("20000000-0000-4000-8000-000000000004", "2030-01-15T14:35:00.000Z", 0),
      ).rejects.toBeInstanceOf(HorarioIndisponivelError);
      await expect(
        tentar("20000000-0000-4000-8000-000000000005", "2030-01-15T14:45:00.000Z", 0),
      ).resolves.toBeUndefined();
    });
  });

  it("RLS das tabelas novas: tenant A nao le nem grava linhas do tenant B", async () => {
    for (const tabela of ["horario_trabalho", "bloqueio", "profissional_servico"]) {
      const visiveis = await comPapel(
        pool,
        { papel: "app_usuario", tenant: a.estabelecimentoId },
        (c) => c.query<{ estabelecimento_id: string }>(`SELECT estabelecimento_id FROM ${tabela}`),
      );
      expect(visiveis.rows.every((l) => l.estabelecimento_id === a.estabelecimentoId)).toBe(true);
    }
    await expect(
      comPapel(pool, { papel: "app_usuario", tenant: a.estabelecimentoId }, (c) =>
        c.query(
          `INSERT INTO horario_trabalho (estabelecimento_id, profissional_id, dia_da_semana, inicio_minutos, fim_minutos)
           VALUES ($1, $2, 3, 540, 720)`,
          [b.estabelecimentoId, b.profissionalId],
        ),
      ),
    ).rejects.toThrow(/row-level security/);
  });
});
