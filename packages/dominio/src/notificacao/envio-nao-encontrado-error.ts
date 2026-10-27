import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class EnvioNaoEncontradoError extends ErroDeDominio {
  readonly codigo = "envio_nao_encontrado";

  constructor() {
    super("Envio de mensagem nao encontrado no provedor.");
  }
}
