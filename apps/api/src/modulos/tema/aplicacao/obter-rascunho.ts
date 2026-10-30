import type { AutorDaAlteracao, LeitorDeTemas, TemaLido } from "@marquei/design-tokens";

/** Ponto de partida do editor (dono/gestor): rascunho, senao publicado, senao padrao da vertical. */
export class ObterRascunho {
  constructor(private readonly leitor: LeitorDeTemas) {}

  execute(entrada: { readonly autor: AutorDaAlteracao }): Promise<TemaLido> {
    return this.leitor.paraEdicao(entrada.autor.estabelecimentoId);
  }
}
