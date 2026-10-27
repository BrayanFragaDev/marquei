import { JanelaDeTempo } from "../agendamento/janela-de-tempo";
import type { ProfissionalId } from "../catalogo/profissional-id";
import { Servico } from "../catalogo/servico";
import type { Instante } from "../compartilhado/instante";
import type { AgendaDoProfissional } from "./agenda-do-profissional";
import type { DiaCivil } from "./dia-civil";
import type { FusoHorario } from "./fuso-horario";
import { HorarioLivre } from "./horario-livre";
import { PassoDaAgendaInvalidoError } from "./passo-da-agenda-invalido-error";

export interface EntradaDoCalculo {
  /** Dia civil no fuso do estabelecimento ao qual os horarios pertencem. */
  readonly dia: DiaCivil;
  readonly fuso: FusoHorario;
  readonly servico: Servico;
  /** Distancia entre inicios consecutivos oferecidos, em minutos. */
  readonly passoMinutos: number;
  readonly agora: Instante;
  readonly agendas: readonly AgendaDoProfissional[];
}

/**
 * Servico de dominio que responde "quais horarios estao livres?". Um horario e oferecido
 * quando: comeca a partir de `agora`; o atendimento cabe num turno do profissional; nao toca
 * folga/bloqueio; e o atendimento com seu intervalo final nao invade nenhum agendamento
 * confirmado (cujo proprio intervalo final tambem conta). O intervalo final pode passar do turno.
 */
export class CalculadoraDeHorariosLivres {
  calcular(entrada: EntradaDoCalculo): readonly HorarioLivre[] {
    if (!Number.isSafeInteger(entrada.passoMinutos) || entrada.passoMinutos < 1) {
      throw new PassoDaAgendaInvalidoError();
    }
    const livres = entrada.agendas.flatMap((agenda) => this.doProfissional(entrada, agenda));
    return livres.sort(
      (a, b) =>
        a.inicio.compararCom(b.inicio) ||
        a.profissionalId.valor.localeCompare(b.profissionalId.valor),
    );
  }

  /** O horario `inicio` esta entre os livres calculados do profissional? */
  estaLivre(entrada: EntradaDoCalculo, profissionalId: ProfissionalId, inicio: Instante): boolean {
    return this.calcular(entrada).some(
      (l) => l.profissionalId.igual(profissionalId) && l.inicio.igual(inicio),
    );
  }

  /**
   * Janela que a aplicacao deve carregar (agendamentos e bloqueios) para o calculo do dia:
   * o dia local mais a folga maxima, pois um horario no fim do dia pode invadir o dia seguinte.
   */
  janelaDeConsulta(dia: DiaCivil, fuso: FusoHorario): JanelaDeTempo {
    const doDia = fuso.janelaDoDia(dia);
    return JanelaDeTempo.criar(
      doDia.inicio,
      doDia.fim.maisMinutos(Servico.INTERVALO_MAXIMO_MINUTOS),
    );
  }

  private doProfissional(entrada: EntradaDoCalculo, agenda: AgendaDoProfissional): HorarioLivre[] {
    const { profissional } = agenda;
    if (!profissional.atende(entrada.servico.id)) return [];
    const inicios = new Map<number, HorarioLivre>();
    for (const horario of agenda.horarios) {
      if (!horario.aplicaEm(entrada.dia)) continue;
      const turno = horario.janelaEm(entrada.dia, entrada.fuso);
      for (const inicio of this.iniciosDoTurno(turno, entrada)) {
        if (this.cabe(inicio, entrada, agenda)) {
          inicios.set(
            inicio.epochMs,
            new HorarioLivre(profissional.id, entrada.servico.janelaEm(inicio)),
          );
        }
      }
    }
    return [...inicios.values()];
  }

  private iniciosDoTurno(turno: JanelaDeTempo, entrada: EntradaDoCalculo): Instante[] {
    const resultado: Instante[] = [];
    const duracao = entrada.servico.duracaoMinutos;
    for (
      let inicio = turno.inicio;
      !inicio.maisMinutos(duracao).depoisDe(turno.fim);
      inicio = inicio.maisMinutos(entrada.passoMinutos)
    ) {
      if (!inicio.antesDe(entrada.agora)) resultado.push(inicio);
    }
    return resultado;
  }

  private cabe(inicio: Instante, entrada: EntradaDoCalculo, agenda: AgendaDoProfissional): boolean {
    const atendimento = entrada.servico.janelaEm(inicio);
    const ocupacao = entrada.servico.janelaOcupadaEm(inicio);
    const bloqueado = agenda.bloqueios.some(
      (b) => b.valePara(agenda.profissional.id) && b.bloqueia(atendimento),
    );
    if (bloqueado) return false;
    return !agenda.ocupantes.some((a) => a.ocupaHorario() && a.janelaOcupada().sobrepoe(ocupacao));
  }
}
