import type { DadosDeVocabulario } from "@marquei/design-tokens";

export type ChaveDoVocabulario = "profissional" | "servico" | "agendamento";

/** Termos do segmento (ex.: "barbeiro", "procedimento") vindos do tema do estabelecimento. */
export class VocabularioDaVertical {
  private constructor(private readonly termos: DadosDeVocabulario) {}

  static deTema(termos: DadosDeVocabulario): VocabularioDaVertical {
    return new VocabularioDaVertical(termos);
  }

  singular(chave: ChaveDoVocabulario): string {
    return this.termos[chave].singular;
  }

  plural(chave: ChaveDoVocabulario): string {
    return this.termos[chave].plural;
  }
}
