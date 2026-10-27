import type { Instante } from "../compartilhado/instante";

const MAXIMO_DE_FALHAS = 5;
const MINUTOS_DE_BLOQUEIO = 15;

/** Falhas consecutivas de login; na quinta o acesso fica bloqueado por 15 minutos. */
export class ContadorDeTentativas {
  private constructor(
    readonly falhas: number,
    readonly bloqueadoAte: Instante | null,
  ) {}

  static vazio(): ContadorDeTentativas {
    return new ContadorDeTentativas(0, null);
  }

  bloqueado(agora: Instante): boolean {
    return this.bloqueadoAte !== null && agora.antesDe(this.bloqueadoAte);
  }

  comFalha(agora: Instante): ContadorDeTentativas {
    const base = this.bloqueadoAte !== null && !this.bloqueado(agora) ? 0 : this.falhas;
    const falhas = base + 1;
    if (falhas >= MAXIMO_DE_FALHAS) {
      return new ContadorDeTentativas(falhas, agora.maisMinutos(MINUTOS_DE_BLOQUEIO));
    }
    return new ContadorDeTentativas(falhas, null);
  }
}
