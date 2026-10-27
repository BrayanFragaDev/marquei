import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

/** Mensagem unica para e-mail inexistente e senha errada: evita enumeracao de contas. */
export class CredenciaisInvalidasError extends ErroDeDominio {
  readonly codigo = "credenciais_invalidas";

  constructor() {
    super("E-mail ou senha invalidos.");
  }
}
