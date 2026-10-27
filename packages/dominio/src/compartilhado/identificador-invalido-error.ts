import { ErroDeDominio } from "./erro-de-dominio";

export class IdentificadorInvalidoError extends ErroDeDominio {
  readonly codigo = "identificador_invalido";

  constructor(rotulo: string) {
    super(`Identificador de ${rotulo} invalido: esperado um UUID.`);
  }
}
