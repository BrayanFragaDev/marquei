import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class EstabelecimentoNaoEncontradoError extends ErroDeDominio {
  readonly codigo = "estabelecimento_nao_encontrado";

  constructor() {
    super("Estabelecimento nao encontrado.");
  }
}
