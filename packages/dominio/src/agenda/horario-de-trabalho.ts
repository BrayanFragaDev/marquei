import { JanelaDeTempo } from "../agendamento/janela-de-tempo";
import type { ProfissionalId } from "../catalogo/profissional-id";
import type { DiaCivil, DiaDaSemana } from "./dia-civil";
import type { FusoHorario } from "./fuso-horario";
import { HorarioDeTrabalhoInvalidoError } from "./horario-de-trabalho-invalido-error";

const MINUTOS_NO_DIA = 24 * 60;

export interface DadosDoHorarioDeTrabalho {
  readonly profissionalId: ProfissionalId;
  readonly diaDaSemana: DiaDaSemana;
  /** Minutos desde a meia-noite LOCAL (0 a 1439). */
  readonly inicioMinutos: number;
  /** Minutos desde a meia-noite LOCAL; 1440 significa a meia-noite seguinte. */
  readonly fimMinutos: number;
}

/**
 * Um turno semanal recorrente de um profissional, em hora local do estabelecimento
 * (ex.: toda terca das 09:00 as 12:00). Dois turnos no mesmo dia deixam o intervalo livre.
 */
export class HorarioDeTrabalho {
  private constructor(
    readonly profissionalId: ProfissionalId,
    readonly diaDaSemana: DiaDaSemana,
    readonly inicioMinutos: number,
    readonly fimMinutos: number,
  ) {}

  static criar(dados: DadosDoHorarioDeTrabalho): HorarioDeTrabalho {
    const { diaDaSemana, inicioMinutos, fimMinutos } = dados;
    if (!Number.isInteger(diaDaSemana) || diaDaSemana < 0 || diaDaSemana > 6) {
      throw new HorarioDeTrabalhoInvalidoError("o dia da semana vai de 0 (domingo) a 6 (sabado)");
    }
    const inteiros = Number.isInteger(inicioMinutos) && Number.isInteger(fimMinutos);
    if (!inteiros || inicioMinutos < 0 || fimMinutos > MINUTOS_NO_DIA) {
      throw new HorarioDeTrabalhoInvalidoError("os minutos devem ser inteiros entre 0 e 1440");
    }
    if (fimMinutos <= inicioMinutos) {
      throw new HorarioDeTrabalhoInvalidoError("o turno deve terminar depois de comecar");
    }
    return new HorarioDeTrabalho(dados.profissionalId, diaDaSemana, inicioMinutos, fimMinutos);
  }

  aplicaEm(dia: DiaCivil): boolean {
    return dia.diaDaSemana() === this.diaDaSemana;
  }

  /** O turno como janela de instantes, no fuso do estabelecimento. */
  janelaEm(dia: DiaCivil, fuso: FusoHorario): JanelaDeTempo {
    return JanelaDeTempo.criar(
      fuso.instanteDe(dia, this.inicioMinutos),
      fuso.instanteDe(dia, this.fimMinutos),
    );
  }
}
