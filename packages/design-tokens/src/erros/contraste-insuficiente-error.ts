import { ErroDeDominio } from "@marquei/dominio";
import type { ProblemaDeContraste } from "../contraste/problema-de-contraste";

/** Publicacao recusada: ha pares de cores abaixo do minimo WCAG AA. Carrega as sugestoes. */
export class ContrasteInsuficienteError extends ErroDeDominio {
  readonly codigo = "contraste_insuficiente";

  constructor(readonly problemas: readonly ProblemaDeContraste[]) {
    const detalhes = problemas.map((p) => p.mensagem()).join(" ");
    super(
      `Contraste abaixo do minimo WCAG AA em ${problemas.length} par(es) de cores. ${detalhes}`,
    );
  }
}
