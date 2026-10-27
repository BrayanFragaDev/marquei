import type { GeradorDeIdentificador } from "./gerador-de-identificador";
import { Identificador } from "./identificador";

/**
 * Gerador deterministico para testes: 00000000-0000-4000-8000-000000000001, ...002, etc.
 * Duas execucoes produzem exatamente os mesmos ids.
 */
export class GeradorSequencialDeIdentificador implements GeradorDeIdentificador {
  private proximo: number;

  constructor(inicio = 1) {
    this.proximo = inicio;
  }

  novo<M extends string>(rotulo: M): Identificador<M> {
    const sufixo = String(this.proximo++).padStart(12, "0");
    return Identificador.de(`00000000-0000-4000-8000-${sufixo}`, rotulo);
  }
}
