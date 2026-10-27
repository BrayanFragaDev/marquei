import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class PapelInvalidoError extends ErroDeDominio {
  readonly codigo = "papel_invalido";

  constructor() {
    super("Papel desconhecido.");
  }
}
