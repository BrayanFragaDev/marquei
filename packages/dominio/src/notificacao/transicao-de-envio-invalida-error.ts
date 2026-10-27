import { ErroDeDominio } from "../compartilhado/erro-de-dominio";
import type { EstadoDaMensagem } from "./estado-da-mensagem";

export class TransicaoDeEnvioInvalidaError extends ErroDeDominio {
  readonly codigo = "transicao_de_envio_invalida";

  constructor(de: EstadoDaMensagem, para: EstadoDaMensagem) {
    super(`Um envio ${de} nao pode passar para ${para}.`);
  }
}
