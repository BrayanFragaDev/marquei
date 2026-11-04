import type { ChaveDoVocabulario, VocabularioDaVertical } from "./vocabulario-da-vertical";

/** Chave do vocabulario e o nome do placeholder no plural (`{profissionais}`, `{Servicos}`). */
const PLURAIS: Readonly<Record<ChaveDoVocabulario, string>> = {
  profissional: "profissionais",
  servico: "servicos",
  agendamento: "agendamentos",
};
const CHAVES: readonly ChaveDoVocabulario[] = ["profissional", "servico", "agendamento"];

const capitalizar = (texto: string): string =>
  texto.length === 0 ? texto : texto.charAt(0).toUpperCase() + texto.slice(1);

/** Aplica o vocabulario da vertical e parametros simples sobre textos do catalogo. */
export class Linguagem {
  constructor(private readonly vocabulario: VocabularioDaVertical) {}

  aplicar(modelo: string, parametros: Readonly<Record<string, string | number>> = {}): string {
    let texto = modelo;
    for (const chave of CHAVES) {
      const singular = this.vocabulario.singular(chave);
      const plural = this.vocabulario.plural(chave);
      texto = texto
        .replaceAll(`{${capitalizar(PLURAIS[chave])}}`, capitalizar(plural))
        .replaceAll(`{${capitalizar(chave)}}`, capitalizar(singular))
        .replaceAll(`{${PLURAIS[chave]}}`, plural)
        .replaceAll(`{${chave}}`, singular);
    }
    for (const [nome, valor] of Object.entries(parametros)) {
      texto = texto.replaceAll(`{${nome}}`, String(valor));
    }
    return texto;
  }

  /** Resolve todos os textos de um grupo plano do catalogo (para passar a componentes de cliente). */
  resolver<T extends Record<string, string>>(grupo: T): T {
    const resolvido = Object.fromEntries(
      Object.entries(grupo).map(([chave, texto]) => [chave, this.aplicar(texto)]),
    );
    return Object.assign({}, grupo, resolvido);
  }
}
