import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class AgendamentoNaoCancelavelError extends ErroDeDominio {
  readonly codigo = "agendamento_nao_cancelavel";

  constructor(status: string) {
    super(`Agendamento com status "${status}" nao pode ser cancelado.`);
  }
}
