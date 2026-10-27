import { InstanteInvalidoError } from "./instante-invalido-error";

const MS_POR_MINUTO = 60_000;
const PADRAO_ISO_UTC = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,3})?Z$/;
const TAMANHO_DATA_E_HORA = 19;

/**
 * Ponto no tempo, sempre em UTC (CLAUDE.md, secao 7). Nunca le o relogio: quem sabe a
 * hora atual e o `Relogio`. Conversao para o fuso do estabelecimento so na apresentacao.
 */
export class Instante {
  private constructor(readonly epochMs: number) {}

  static deEpochMs(epochMs: number): Instante {
    if (!Number.isSafeInteger(epochMs)) throw new InstanteInvalidoError(String(epochMs));
    return new Instante(epochMs);
  }

  /** Aceita somente ISO 8601 terminado em `Z`. Datas inexistentes (30 de fevereiro) sao recusadas. */
  static deIso(texto: string): Instante {
    if (!PADRAO_ISO_UTC.test(texto)) throw new InstanteInvalidoError(texto);
    const epochMs = Date.parse(texto);
    if (Number.isNaN(epochMs)) throw new InstanteInvalidoError(texto);
    // Date.parse "rola" datas impossiveis para o mes seguinte; a ida e volta detecta isso.
    const volta = new Date(epochMs).toISOString().slice(0, TAMANHO_DATA_E_HORA);
    if (volta !== texto.slice(0, TAMANHO_DATA_E_HORA)) throw new InstanteInvalidoError(texto);
    return new Instante(epochMs);
  }

  paraIso(): string {
    return new Date(this.epochMs).toISOString();
  }

  antesDe(outro: Instante): boolean {
    return this.epochMs < outro.epochMs;
  }

  depoisDe(outro: Instante): boolean {
    return this.epochMs > outro.epochMs;
  }

  igual(outro: Instante): boolean {
    return this.epochMs === outro.epochMs;
  }

  /** Retorna novo instante; `minutos` pode ser negativo. */
  maisMinutos(minutos: number): Instante {
    return Instante.deEpochMs(this.epochMs + minutos * MS_POR_MINUTO);
  }

  /** Minutos de `this` ate `outro` (negativo se `outro` for anterior). */
  minutosAte(outro: Instante): number {
    return (outro.epochMs - this.epochMs) / MS_POR_MINUTO;
  }

  /** Ordenacao crescente: use com `Array.prototype.sort`. */
  compararCom(outro: Instante): number {
    return this.epochMs - outro.epochMs;
  }

  toString(): string {
    return this.paraIso();
  }
}
