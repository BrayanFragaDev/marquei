import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class ProfissionalInvalidoError extends ErroDeDominio {
  readonly codigo = "profissional_invalido";

  constructor(motivo: string) {
    super(`Profissional invalido: ${motivo}.`);
  }
}
