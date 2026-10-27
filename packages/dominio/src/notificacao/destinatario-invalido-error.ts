import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class DestinatarioInvalidoError extends ErroDeDominio {
  readonly codigo = "destinatario_invalido";

  /** O motivo nunca deve conter o valor informado: telefone e e-mail sao dado pessoal. */
  constructor(motivo: string) {
    super(`Destinatario de mensagem invalido: ${motivo}.`);
  }
}
