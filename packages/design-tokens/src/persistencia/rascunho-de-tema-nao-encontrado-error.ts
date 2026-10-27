import { ErroDeDominio } from "@marquei/dominio";

/** Publicar exige um rascunho salvo. */
export class RascunhoDeTemaNaoEncontradoError extends ErroDeDominio {
  readonly codigo = "rascunho_de_tema_nao_encontrado";

  constructor() {
    super("Nao ha rascunho de tema para publicar. Salve um rascunho antes.");
  }
}
