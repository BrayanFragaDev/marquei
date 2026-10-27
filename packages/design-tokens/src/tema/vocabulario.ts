import {
  esquemaDeVocabulario,
  type ChaveDeVocabulario,
  type DadosDeTermo,
  type DadosDeVocabulario,
} from "../esquema/esquema-do-tema";
import { validarComEsquema } from "../esquema/validar-com-esquema";

export type Numero = "singular" | "plural";

/**
 * Como o estabelecimento chama "profissional", "servico" e "agendamento"
 * (ex.: barbeiro, procedimento). Imutavel.
 */
export class Vocabulario {
  private constructor(private readonly dados: DadosDeVocabulario) {}

  static criar(entrada: unknown): Vocabulario {
    return new Vocabulario(validarComEsquema(esquemaDeVocabulario, entrada));
  }

  termo(chave: ChaveDeVocabulario, numero: Numero = "singular"): string {
    return this.dados[chave][numero];
  }

  comTermo(chave: ChaveDeVocabulario, termo: DadosDeTermo): Vocabulario {
    return Vocabulario.criar({ ...this.dados, [chave]: termo });
  }

  paraDados(): DadosDeVocabulario {
    return structuredClone(this.dados);
  }
}
