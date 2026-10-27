import type { CampoDeCor } from "../esquema/esquema-do-tema";
import type { PaletaDeCores } from "../tema/paleta-de-cores";
import { ProblemaDeContraste } from "./problema-de-contraste";
import type { RequisitoDeContraste } from "./requisito-de-contraste";

/** Regra de acessibilidade: `primeiroPlano` sobre `fundo` deve atender `requisito`. */
export class ParDeContraste {
  constructor(
    readonly primeiroPlano: CampoDeCor,
    readonly fundo: CampoDeCor,
    readonly requisito: RequisitoDeContraste,
    /** Cor que a correcao sugerida altera (a outra fica fixa). */
    readonly campoAjustavel: CampoDeCor,
  ) {}

  avaliar(paleta: PaletaDeCores): ProblemaDeContraste | null {
    const frente = paleta.obter(this.primeiroPlano);
    const atras = paleta.obter(this.fundo);
    const razao = frente.razaoDeContraste(atras);
    if (this.requisito.atendidoPor(razao)) return null;
    const fixa = this.campoAjustavel === this.primeiroPlano ? atras : frente;
    const sugerida = paleta
      .obter(this.campoAjustavel)
      .comContrasteMinimoSobre(fixa, this.requisito.razaoMinima);
    return new ProblemaDeContraste({
      primeiroPlano: this.primeiroPlano,
      fundo: this.fundo,
      razaoObtida: razao,
      razaoExigida: this.requisito.razaoMinima,
      campoAjustado: this.campoAjustavel,
      corSugerida: sugerida,
    });
  }
}
