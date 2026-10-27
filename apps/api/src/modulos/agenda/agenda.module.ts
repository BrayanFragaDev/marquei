import { Module } from "@nestjs/common";
import {
  CalculadoraDeHorariosLivres,
  type AgendamentoRepositorio,
  type BloqueioRepositorio,
  type EstabelecimentoRepositorio,
  type HorarioDeTrabalhoRepositorio,
  type ProfissionalRepositorio,
  type PublicadorDeEventos,
  type Relogio,
  type ServicoRepositorio,
} from "@marquei/dominio";
import { ProvedorDeTransacao, PUBLICADOR_DE_EVENTOS } from "../../nucleo";
import { RelogioDoSistema } from "../../seguranca/relogio-do-sistema";
import { SegurancaModule } from "../../seguranca/seguranca.module";
import {
  CatalogoModule,
  ESTABELECIMENTOS,
  PROFISSIONAIS,
  SERVICOS,
} from "../catalogo/catalogo.module";
import { AgendasDoDia } from "./aplicacao/agendas-do-dia";
import { CancelarAgendamento } from "./aplicacao/cancelar-agendamento";
import { ConsultarHorariosLivres } from "./aplicacao/consultar-horarios-livres";
import { CriarAgendamento } from "./aplicacao/criar-agendamento";
import { AgendamentoRepositorioPostgres } from "./infra/agendamento-repositorio-postgres";
import { BloqueioRepositorioPostgres } from "./infra/bloqueio-repositorio-postgres";
import { GeradorDeIdentificadorUuid } from "./infra/gerador-de-identificador-uuid";
import { HorarioDeTrabalhoRepositorioPostgres } from "./infra/horario-de-trabalho-repositorio-postgres";
import { AgendamentosController } from "./interface/agendamentos.controller";
import { HorariosLivresController } from "./interface/horarios-livres.controller";

const AGENDAMENTOS = Symbol("AGENDAMENTOS");
const HORARIOS = Symbol("HORARIOS");
const BLOQUEIOS = Symbol("BLOQUEIOS");

const CALCULADORA = new CalculadoraDeHorariosLivres();

/** Agenda: horarios livres, criar e cancelar agendamento. */
@Module({
  imports: [SegurancaModule, CatalogoModule],
  controllers: [HorariosLivresController, AgendamentosController],
  providers: [
    {
      provide: AGENDAMENTOS,
      inject: [ProvedorDeTransacao],
      useFactory: (t: ProvedorDeTransacao): AgendamentoRepositorio =>
        new AgendamentoRepositorioPostgres(t),
    },
    {
      provide: HORARIOS,
      inject: [ProvedorDeTransacao],
      useFactory: (t: ProvedorDeTransacao): HorarioDeTrabalhoRepositorio =>
        new HorarioDeTrabalhoRepositorioPostgres(t),
    },
    {
      provide: BLOQUEIOS,
      inject: [ProvedorDeTransacao],
      useFactory: (t: ProvedorDeTransacao): BloqueioRepositorio =>
        new BloqueioRepositorioPostgres(t),
    },
    {
      provide: AgendasDoDia,
      inject: [HORARIOS, BLOQUEIOS, AGENDAMENTOS],
      useFactory: (
        horarios: HorarioDeTrabalhoRepositorio,
        bloqueios: BloqueioRepositorio,
        agendamentos: AgendamentoRepositorio,
      ) => new AgendasDoDia({ horarios, bloqueios, agendamentos, calculadora: CALCULADORA }),
    },
    {
      provide: ConsultarHorariosLivres,
      inject: [ESTABELECIMENTOS, SERVICOS, PROFISSIONAIS, AgendasDoDia, RelogioDoSistema],
      // Rest com tupla: o Nest injeta na ordem de `inject`; sao 5 colaboradores.
      useFactory: (
        ...[estabelecimentos, servicos, profissionais, agendas, relogio]: [
          EstabelecimentoRepositorio,
          ServicoRepositorio,
          ProfissionalRepositorio,
          AgendasDoDia,
          Relogio,
        ]
      ) =>
        new ConsultarHorariosLivres({
          estabelecimentos,
          servicos,
          profissionais,
          agendas,
          calculadora: CALCULADORA,
          relogio,
        }),
    },
    {
      provide: CriarAgendamento,
      inject: [
        ESTABELECIMENTOS,
        SERVICOS,
        PROFISSIONAIS,
        AGENDAMENTOS,
        AgendasDoDia,
        PUBLICADOR_DE_EVENTOS,
        RelogioDoSistema,
      ],
      // Rest com tupla: o Nest injeta na ordem de `inject`; sao 7 colaboradores.
      useFactory: (
        ...[estabelecimentos, servicos, profissionais, agendamentos, agendas, eventos, relogio]: [
          EstabelecimentoRepositorio,
          ServicoRepositorio,
          ProfissionalRepositorio,
          AgendamentoRepositorio,
          AgendasDoDia,
          PublicadorDeEventos,
          Relogio,
        ]
      ) =>
        new CriarAgendamento({
          estabelecimentos,
          servicos,
          profissionais,
          agendamentos,
          agendas,
          calculadora: CALCULADORA,
          eventos,
          identificadores: new GeradorDeIdentificadorUuid(),
          relogio,
        }),
    },
    {
      provide: CancelarAgendamento,
      inject: [ESTABELECIMENTOS, AGENDAMENTOS, PUBLICADOR_DE_EVENTOS, RelogioDoSistema],
      useFactory: (
        estabelecimentos: EstabelecimentoRepositorio,
        agendamentos: AgendamentoRepositorio,
        eventos: PublicadorDeEventos,
        relogio: Relogio,
      ) => new CancelarAgendamento({ estabelecimentos, agendamentos, eventos, relogio }),
    },
  ],
})
export class AgendaModule {}
