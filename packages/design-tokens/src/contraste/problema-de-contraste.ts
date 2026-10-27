import type { CorHex } from "../cor/cor-hex";
import type { CampoDeCor } from "../esquema/esquema-do-tema";

export interface DadosDoProblema {
  readonly primeiroPlano: CampoDeCor;
  readonly fundo: CampoDeCor;
  readonly razaoObtida: number;
  readonly razaoExigida: number;
  readonly campoAjustado: CampoDeCor;
  readonly corSugerida: string;
}

export interface EntradaDoProblema {
  readonly primeiroPlano: CampoDeCor;
  readonly fundo: CampoDeCor;
  readonly razaoObtida: number;
  readonly razaoExigida: number;
  readonly campoAjustado: CampoDeCor;
  readonly corSugerida: CorHex;
}

/** Um par de cores reprovado, com a correcao sugerida (cor do `campoAjustado` que passa). */
export class ProblemaDeContraste {
  readonly primeiroPlano: CampoDeCor;
  readonly fundo: CampoDeCor;
  readonly razaoObtida: number;
  readonly razaoExigida: number;
  readonly campoAjustado: CampoDeCor;
  readonly corSugerida: CorHex;

  constructor(entrada: EntradaDoProblema) {
    this.primeiroPlano = entrada.primeiroPlano;
    this.fundo = entrada.fundo;
    this.razaoObtida = entrada.razaoObtida;
    this.razaoExigida = entrada.razaoExigida;
    this.campoAjustado = entrada.campoAjustado;
    this.corSugerida = entrada.corSugerida;
  }

  mensagem(): string {
    return (
      `"${this.primeiroPlano}" sobre "${this.fundo}" tem contraste ${truncar(this.razaoObtida)}:1 ` +
      `(minimo ${this.razaoExigida}:1). Sugestao: use ${this.corSugerida.valor} em "${this.campoAjustado}".`
    );
  }

  paraDados(): DadosDoProblema {
    return {
      primeiroPlano: this.primeiroPlano,
      fundo: this.fundo,
      razaoObtida: this.razaoObtida,
      razaoExigida: this.razaoExigida,
      campoAjustado: this.campoAjustado,
      corSugerida: this.corSugerida.valor,
    };
  }
}

/** Trunca (nao arredonda) para nao exibir "4.50" quando o valor real e 4.497. */
function truncar(razao: number): string {
  return (Math.floor(razao * 100) / 100).toFixed(2);
}
