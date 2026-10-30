import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class PassoDaAgendaInvalidoError extends ErroDeDominio {
  readonly codigo = "passo_da_agenda_invalido";

  constructor() {
    super("O passo da agenda deve ser um numero inteiro positivo de minutos.");
  }
}
