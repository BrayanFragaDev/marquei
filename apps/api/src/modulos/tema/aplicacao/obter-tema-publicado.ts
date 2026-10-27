import type { EstabelecimentoId } from "@marquei/dominio";
import type { LeitorDeTemas, TemaLido } from "@marquei/design-tokens";

/** Tema que o cliente ve: o publicado (ou o padrao da vertical). Nunca o rascunho. */
export class ObterTemaPublicado {
  constructor(private readonly leitor: LeitorDeTemas) {}

  execute(entrada: { readonly estabelecimentoId: EstabelecimentoId }): Promise<TemaLido> {
    return this.leitor.publicadoOuPadrao(entrada.estabelecimentoId);
  }
}
