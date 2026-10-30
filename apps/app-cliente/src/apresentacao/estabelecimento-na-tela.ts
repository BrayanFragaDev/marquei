import {
  TemaDoEstabelecimento,
  paraVariaveisCss,
  temaPadraoDaVertical,
  verticalOuPadrao,
} from "@marquei/design-tokens";
import type { components } from "@marquei/api-client";
import { urlDaFonteDoTema } from "./fonte-do-tema";
import { VocabularioDoEstabelecimento } from "./vocabulario-do-estabelecimento";

export type EstabelecimentoPublico = components["schemas"]["EstabelecimentoPublico"];

/**
 * Estabelecimento pronto para a tela: tema PUBLICADO (ou padrão da vertical), vocabulário e
 * variáveis CSS. Cliente nunca vê rascunho: a API só devolve o publicado.
 */
export class EstabelecimentoNaTela {
  private constructor(
    readonly dados: EstabelecimentoPublico,
    readonly tema: TemaDoEstabelecimento,
    readonly vocabulario: VocabularioDoEstabelecimento,
  ) {}

  static criar(dados: EstabelecimentoPublico): EstabelecimentoNaTela {
    const tema = temaDe(dados);
    const vocabulario = VocabularioDoEstabelecimento.criar(dados.vocabulario, tema.vocabulario);
    return new EstabelecimentoNaTela(dados, tema, vocabulario);
  }

  get slug(): string {
    return this.dados.slug;
  }
  get nome(): string {
    return this.dados.nome;
  }
  get fusoHorario(): string {
    return this.dados.fusoHorario;
  }
  get variaveisCss(): Readonly<Record<string, string>> {
    return paraVariaveisCss(this.tema).variaveis;
  }
  get urlDaFonte(): string {
    return urlDaFonteDoTema(this.tema.familia);
  }
  /** Cor da barra do navegador e do ícone instalado. */
  get corPrincipal(): string {
    return this.tema.cores.obter("primaria").valor;
  }
  get corDeFundo(): string {
    return this.tema.cores.obter("fundo").valor;
  }
}

function temaDe(dados: EstabelecimentoPublico): TemaDoEstabelecimento {
  if (dados.tema) {
    try {
      return TemaDoEstabelecimento.criar(dados.tema.tokens);
    } catch {
      // Tema publicado ilegível não pode derrubar a vitrine: cai no padrão da vertical.
    }
  }
  return temaPadraoDaVertical(verticalOuPadrao(dados.vertical));
}
