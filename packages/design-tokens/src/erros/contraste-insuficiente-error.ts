import type { ProblemaDeContraste } from "../contraste/problema-de-contraste";
import { ErroDeTema } from "./erro-de-tema";

/** Publicacao recusada: ha pares de cores abaixo do minimo WCAG AA. Carrega as sugestoes. */
export class ContrasteInsuficienteError extends ErroDeTema {
  constructor(readonly problemas: readonly ProblemaDeContraste[]) {
    const detalhes = problemas.map((p) => p.mensagem()).join(" ");
    super(
      "contraste_insuficiente",
      `Contraste abaixo do minimo WCAG AA em ${problemas.length} par(es) de cores. ${detalhes}`,
    );
  }
}
