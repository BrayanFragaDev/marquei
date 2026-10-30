import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class AcaoNaoPermitidaError extends ErroDeDominio {
  readonly codigo = "acao_nao_permitida";

  constructor() {
    super("Seu perfil nao pode realizar esta acao.");
  }
}
