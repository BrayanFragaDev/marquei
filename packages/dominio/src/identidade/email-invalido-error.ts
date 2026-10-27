import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class EmailInvalidoError extends ErroDeDominio {
  readonly codigo = "email_invalido";

  constructor() {
    super("E-mail invalido.");
  }
}
