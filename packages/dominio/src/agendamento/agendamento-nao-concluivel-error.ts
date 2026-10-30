import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class AgendamentoNaoConcluivelError extends ErroDeDominio {
  readonly codigo = "agendamento_nao_concluivel";

  constructor(motivo: string) {
    super(`Agendamento nao pode ser concluido: ${motivo}.`);
  }
}
