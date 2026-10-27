import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class ModeloDeMensagemInvalidoError extends ErroDeDominio {
  readonly codigo = "modelo_de_mensagem_invalido";

  constructor(motivo: string) {
    super(`Modelo de mensagem invalido: ${motivo}.`);
  }
}
