import type { Vocabulario } from "@marquei/design-tokens";
import { VOCABULARIO_PADRAO } from "../mensagens/catalogo-pt-br";

export type TermoDoVocabulario = keyof typeof VOCABULARIO_PADRAO;
export const TERMOS = Object.keys(VOCABULARIO_PADRAO) as readonly TermoDoVocabulario[];

type Singulares = Readonly<Partial<Record<string, string>>>;

/**
 * Como o estabelecimento chama profissional, serviço, cliente etc. (vem da vertical e do tema).
 * Imutável. Singular vem da API pública; plural e "agendamento" vêm do tema quando coincidem.
 */
export class VocabularioDoEstabelecimento {
  private constructor(
    private readonly termos: ReadonlyMap<TermoDoVocabulario, readonly [string, string]>,
  ) {}

  static criar(singulares: Singulares, tema?: Vocabulario): VocabularioDoEstabelecimento {
    const pares = TERMOS.map((termo) => {
      const padrao = VOCABULARIO_PADRAO[termo];
      const doTema = tema && temTermoNoTema(termo) ? tema.termo(termo, "singular") : undefined;
      const singular = singulares[termo] ?? doTema ?? padrao.singular;
      const plural =
        tema && temTermoNoTema(termo) && doTema === singular
          ? tema.termo(termo, "plural")
          : pluralDe(singular);
      return [termo, [singular, plural] as const] as const;
    });
    return new VocabularioDoEstabelecimento(new Map(pares));
  }

  singular(termo: TermoDoVocabulario): string {
    return this.termos.get(termo)?.[0] ?? VOCABULARIO_PADRAO[termo].singular;
  }

  plural(termo: TermoDoVocabulario): string {
    return this.termos.get(termo)?.[1] ?? VOCABULARIO_PADRAO[termo].plural;
  }
}

function temTermoNoTema(
  termo: TermoDoVocabulario,
): termo is "profissional" | "servico" | "agendamento" {
  return termo === "profissional" || termo === "servico" || termo === "agendamento";
}

/** Plural regular simples; usado só quando o tema não informa o plural. */
function pluralDe(singular: string): string {
  if (/l$/.test(singular)) return `${singular.slice(0, -1)}is`;
  if (/[rz]$/.test(singular)) return `${singular}es`;
  return `${singular}s`;
}
