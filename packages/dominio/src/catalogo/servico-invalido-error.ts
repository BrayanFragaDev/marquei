import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class ServicoInvalidoError extends ErroDeDominio {
  readonly codigo = "servico_invalido";

  constructor(motivo: string) {
    super(`Servico invalido: ${motivo}.`);
  }
}
