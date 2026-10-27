import { Instante } from "../compartilhado/instante";
import { JanelaDeTempo } from "../agendamento/janela-de-tempo";
import { DiaCivil } from "./dia-civil";
import { FusoHorarioInvalidoError } from "./fuso-horario-invalido-error";

const MS_POR_DIA = 86_400_000;
const MS_POR_SEGUNDO = 1000;

/**
 * Fuso IANA do estabelecimento. Unico ponto do dominio que converte entre instantes (UTC) e
 * dias/horas locais; usa a base de fusos da plataforma (`Intl`), inclusive o horario de verao
 * historico. Instantes inexistentes (salto do verao) avancam para depois do salto; instantes
 * repetidos (fim do verao) valem a primeira ocorrencia.
 */
export class FusoHorario {
  private constructor(
    readonly nome: string,
    private readonly formatador: Intl.DateTimeFormat,
  ) {}

  static de(nome: string): FusoHorario {
    try {
      const formatador = new Intl.DateTimeFormat("en-US", {
        timeZone: nome,
        hourCycle: "h23",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      });
      return new FusoHorario(nome, formatador);
    } catch {
      throw new FusoHorarioInvalidoError(nome);
    }
  }

  /** Dia civil local em que `instante` cai. */
  diaCivilDe(instante: Instante): DiaCivil {
    return DiaCivil.deEpochMsLocal(instante.epochMs + this.deslocamentoEm(instante.epochMs));
  }

  /** Instante do horario local `minutosDoDia` (0 a 1440) de `dia`. */
  instanteDe(dia: DiaCivil, minutosDoDia: number): Instante {
    const local = dia.epochMsLocal(minutosDoDia);
    const antes = this.deslocamentoEm(local - MS_POR_DIA);
    const depois = this.deslocamentoEm(local + MS_POR_DIA);
    const validos = [...new Set([antes, depois])]
      .map((deslocamento) => local - deslocamento)
      .filter((candidato) => local - candidato === this.deslocamentoEm(candidato));
    // Sem candidato valido o horario caiu no salto do verao: usa o deslocamento de antes do salto.
    return Instante.deEpochMs(validos.length > 0 ? Math.min(...validos) : local - antes);
  }

  /** [00:00 local do dia, 00:00 local do dia seguinte): tem 23h, 24h ou 25h. */
  janelaDoDia(dia: DiaCivil): JanelaDeTempo {
    return JanelaDeTempo.criar(this.instanteDe(dia, 0), this.instanteDe(dia.maisDias(1), 0));
  }

  igual(outro: FusoHorario): boolean {
    return this.nome === outro.nome;
  }

  /** Milissegundos a somar ao UTC para obter a hora de parede local. */
  private deslocamentoEm(epochMs: number): number {
    const arredondado = Math.floor(epochMs / MS_POR_SEGUNDO) * MS_POR_SEGUNDO;
    const campos = new Map<string, number>();
    for (const parte of this.formatador.formatToParts(new Date(arredondado))) {
      if (parte.type !== "literal") campos.set(parte.type, Number(parte.value));
    }
    const parede = Date.UTC(
      campos.get("year") ?? 0,
      (campos.get("month") ?? 1) - 1,
      campos.get("day") ?? 1,
      campos.get("hour") ?? 0,
      campos.get("minute") ?? 0,
      campos.get("second") ?? 0,
    );
    return parede - arredondado;
  }
}
