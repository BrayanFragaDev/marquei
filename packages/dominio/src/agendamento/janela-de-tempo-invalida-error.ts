import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class JanelaDeTempoInvalidaError extends ErroDeDominio {
  readonly codigo = "janela_de_tempo_invalida";

  constructor() {
    super("A janela de tempo deve terminar depois de comecar.");
  }
}
