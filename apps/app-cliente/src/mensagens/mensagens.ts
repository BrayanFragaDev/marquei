import {
  TERMOS,
  type VocabularioDoEstabelecimento,
} from "../apresentacao/vocabulario-do-estabelecimento";
import { CATALOGO_PT_BR, type ChaveDeMensagem } from "./catalogo-pt-br";

export type { ChaveDeMensagem } from "./catalogo-pt-br";
export type ParametrosDeMensagem = Readonly<Record<string, string | number>>;

const capitalizar = (texto: string): string =>
  texto.charAt(0).toLocaleUpperCase("pt-BR") + texto.slice(1);

function ehChave(texto: string): texto is ChaveDeMensagem {
  return Object.hasOwn(CATALOGO_PT_BR, texto);
}

/** Lookup tipado do catálogo, com interpolação e vocabulário dinâmico do estabelecimento. */
export class Mensagens {
  private readonly vocabulario: ParametrosDeMensagem;

  constructor(vocabulario: VocabularioDoEstabelecimento) {
    this.vocabulario = Object.fromEntries(
      TERMOS.flatMap((termo) => {
        const singular = vocabulario.singular(termo);
        const plural = vocabulario.plural(termo);
        return [
          [termo, singular],
          [capitalizar(termo), capitalizar(singular)],
          [`${termo}_pl`, plural],
          [`${capitalizar(termo)}_pl`, capitalizar(plural)],
        ] as const;
      }),
    );
  }

  t(chave: ChaveDeMensagem, parametros: ParametrosDeMensagem = {}): string {
    const valores = { ...this.vocabulario, ...parametros };
    return CATALOGO_PT_BR[chave].replace(/\{(\w+)\}/g, (marcador, nome: string) => {
      const valor = valores[nome];
      return valor === undefined ? marcador : String(valor);
    });
  }

  /** Mensagem de um código de erro estável da API; cai no genérico se não houver tradução. */
  paraErro(codigo: string): string {
    const chave = `erro.${codigo}`;
    return this.t(ehChave(chave) ? chave : "erro.generico");
  }
}
