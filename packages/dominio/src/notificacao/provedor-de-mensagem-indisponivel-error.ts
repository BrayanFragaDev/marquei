import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

/** Falha transitoria: quem chama pode tentar de novo com backoff. */
export class ProvedorDeMensagemIndisponivelError extends ErroDeDominio {
  readonly codigo = "provedor_de_mensagem_indisponivel";
  readonly retentavel = true;

  constructor(opcoes?: ErrorOptions) {
    super("O provedor de mensagem esta indisponivel no momento.", opcoes);
  }
}
