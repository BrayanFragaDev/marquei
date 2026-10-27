import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

/** Falha definitiva: repetir o envio nao resolve (ex.: numero inexistente, opt-out no provedor). */
export class MensagemRejeitadaPeloProvedorError extends ErroDeDominio {
  readonly codigo = "mensagem_rejeitada_pelo_provedor";
  readonly retentavel = false;

  constructor(motivo: string, opcoes?: ErrorOptions) {
    super(`O provedor rejeitou a mensagem: ${motivo}.`, opcoes);
  }
}
