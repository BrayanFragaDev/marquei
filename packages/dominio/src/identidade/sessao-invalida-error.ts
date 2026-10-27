import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

/** Sessao malformada, incoerente ou de outra audiencia. A mensagem nunca revela o motivo ao cliente. */
export class SessaoInvalidaError extends ErroDeDominio {
  readonly codigo = "sessao_invalida";

  constructor(motivo = "Sessao invalida.") {
    super(motivo);
  }
}
