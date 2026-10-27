import { DinheiroInvalidoError } from "./dinheiro-invalido-error";

/** Valor em reais guardado em centavos inteiros e nao negativos. Nunca usa ponto flutuante. */
export class Dinheiro {
  private constructor(readonly centavos: number) {}

  static deCentavos(centavos: number): Dinheiro {
    if (!Number.isSafeInteger(centavos)) {
      throw new DinheiroInvalidoError("os centavos devem ser um numero inteiro");
    }
    if (centavos < 0) throw new DinheiroInvalidoError("nao pode ser negativo");
    return new Dinheiro(centavos);
  }

  static zero(): Dinheiro {
    return new Dinheiro(0);
  }

  somar(outro: Dinheiro): Dinheiro {
    return Dinheiro.deCentavos(this.centavos + outro.centavos);
  }

  /** Falha se o resultado ficaria negativo. */
  subtrair(outro: Dinheiro): Dinheiro {
    return Dinheiro.deCentavos(this.centavos - outro.centavos);
  }

  /** `fator` deve ser inteiro; percentuais fracionarios pertencem a uma regra propria. */
  multiplicarPor(fator: number): Dinheiro {
    if (!Number.isSafeInteger(fator)) {
      throw new DinheiroInvalidoError("o fator deve ser um numero inteiro");
    }
    return Dinheiro.deCentavos(this.centavos * fator);
  }

  igual(outro: Dinheiro): boolean {
    return this.centavos === outro.centavos;
  }

  maiorQue(outro: Dinheiro): boolean {
    return this.centavos > outro.centavos;
  }

  ehZero(): boolean {
    return this.centavos === 0;
  }
}
