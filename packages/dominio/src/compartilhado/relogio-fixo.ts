import type { Instante } from "./instante";
import type { Relogio } from "./relogio";

/** Relogio imutavel para testes: sempre a mesma hora. `avancadoEm` devolve outro relogio. */
export class RelogioFixo implements Relogio {
  constructor(private readonly instante: Instante) {}

  agora(): Instante {
    return this.instante;
  }

  avancadoEm(minutos: number): RelogioFixo {
    return new RelogioFixo(this.instante.maisMinutos(minutos));
  }
}
