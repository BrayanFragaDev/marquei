import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class IdDoProvedorInvalidoError extends ErroDeDominio {
  readonly codigo = "id_do_provedor_invalido";

  constructor(motivo: string) {
    super(`Identificador do provedor de mensagem invalido: ${motivo}.`);
  }
}
