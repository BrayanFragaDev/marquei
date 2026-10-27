import { ErroDeTema } from "./erro-de-tema";

export interface ProblemaDeEsquema {
  readonly caminho: string;
  readonly mensagem: string;
}

/** A entrada nao respeita o esquema do tema (campo faltando, cor mal formada, opcao nao curada). */
export class TemaInvalidoError extends ErroDeTema {
  constructor(readonly problemas: readonly ProblemaDeEsquema[]) {
    const detalhes = problemas.map((p) => `${p.caminho || "(raiz)"}: ${p.mensagem}`).join("; ");
    super("tema_invalido", `Tema invalido. ${detalhes}`);
  }
}
