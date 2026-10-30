import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class AgendamentoNaoRemarcavelError extends ErroDeDominio {
  readonly codigo = "agendamento_nao_remarcavel";

  constructor(status: string) {
    super(`Agendamento com status "${status}" nao pode ser remarcado.`);
  }
}
