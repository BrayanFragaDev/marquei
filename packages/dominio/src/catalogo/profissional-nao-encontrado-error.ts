import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class ProfissionalNaoEncontradoError extends ErroDeDominio {
  readonly codigo = "profissional_nao_encontrado";

  constructor() {
    super("Profissional nao encontrado.");
  }
}
