import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class AgendamentoNaoEncontradoError extends ErroDeDominio {
  readonly codigo = "agendamento_nao_encontrado";

  constructor() {
    super("Agendamento nao encontrado.");
  }
}
