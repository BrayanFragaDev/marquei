import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class ForaDoPrazoDeCancelamentoError extends ErroDeDominio {
  readonly codigo = "fora_do_prazo_de_cancelamento";

  constructor() {
    super("O prazo para cancelar este agendamento ja passou.");
  }
}
