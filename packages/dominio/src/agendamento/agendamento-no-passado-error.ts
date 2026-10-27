import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class AgendamentoNoPassadoError extends ErroDeDominio {
  readonly codigo = "agendamento_no_passado";

  constructor() {
    super("Nao e possivel agendar em um horario que ja passou.");
  }
}
