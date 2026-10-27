import type { Instante } from "../compartilhado/instante";
import { JanelaDeTempoInvalidaError } from "./janela-de-tempo-invalida-error";

/** Intervalo semiaberto [inicio, fim) em UTC. Fim estritamente depois do inicio. */
export class JanelaDeTempo {
  private constructor(
    readonly inicio: Instante,
    readonly fim: Instante,
  ) {}

  static criar(inicio: Instante, fim: Instante): JanelaDeTempo {
    if (!fim.depoisDe(inicio)) throw new JanelaDeTempoInvalidaError();
    return new JanelaDeTempo(inicio, fim);
  }

  static comDuracao(inicio: Instante, minutos: number): JanelaDeTempo {
    return JanelaDeTempo.criar(inicio, inicio.maisMinutos(minutos));
  }

  duracaoEmMinutos(): number {
    return this.inicio.minutosAte(this.fim);
  }

  /** Janelas que apenas se tocam (fim de uma = inicio da outra) nao se sobrepoem. */
  sobrepoe(outra: JanelaDeTempo): boolean {
    return this.inicio.antesDe(outra.fim) && outra.inicio.antesDe(this.fim);
  }
}
