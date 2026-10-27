import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class ServicoNaoEncontradoError extends ErroDeDominio {
  readonly codigo = "servico_nao_encontrado";

  constructor() {
    super("Servico nao encontrado.");
  }
}
