import { ContrasteInsuficienteError } from "../erros/contraste-insuficiente-error";
import type { TemaDoEstabelecimento } from "../tema/tema-do-estabelecimento";
import type { ParDeContraste } from "./par-de-contraste";
import { PARES_PADRAO } from "./pares-padrao";
import type { ProblemaDeContraste } from "./problema-de-contraste";

/** Valida os pares de cores de um tema contra WCAG AA e sugere correcoes. */
export class ValidadorDeContraste {
  constructor(private readonly pares: readonly ParDeContraste[] = PARES_PADRAO) {}

  /** Lista de problemas (vazia se o tema esta em AA). Nunca lanca: serve ao rascunho. */
  validar(tema: TemaDoEstabelecimento): readonly ProblemaDeContraste[] {
    return this.pares.flatMap((par) => {
      const problema = par.avaliar(tema.cores);
      return problema ? [problema] : [];
    });
  }

  aprova(tema: TemaDoEstabelecimento): boolean {
    return this.validar(tema).length === 0;
  }

  /**
   * Aplica as sugestoes uma a uma, revalidando a cada passo (as correcoes de um mesmo campo
   * se acumulam). Devolve um novo tema; se o conjunto de cores for impossivel de satisfazer,
   * devolve o melhor esforco, e `aprova` informa se ficou em AA.
   */
  corrigir(tema: TemaDoEstabelecimento): TemaDoEstabelecimento {
    let atual = tema;
    for (let tentativa = 0; tentativa < this.pares.length * 2; tentativa++) {
      const primeiro = this.validar(atual)[0];
      if (!primeiro) return atual;
      atual = atual.comCores(atual.cores.comCor(primeiro.campoAjustado, primeiro.corSugerida));
    }
    return atual;
  }

  /** Operacao de publicacao: lanca `ContrasteInsuficienteError` com as sugestoes. */
  exigirPublicavel(tema: TemaDoEstabelecimento): void {
    const problemas = this.validar(tema);
    if (problemas.length > 0) throw new ContrasteInsuficienteError(problemas);
  }
}
