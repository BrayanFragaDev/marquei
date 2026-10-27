import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

/** Falha transitoria: quem chama pode tentar de novo com backoff. */
export class GatewayDePagamentoIndisponivelError extends ErroDeDominio {
  readonly codigo = "gateway_de_pagamento_indisponivel";
  readonly retentavel = true;

  constructor(opcoes?: ErrorOptions) {
    super("O gateway de pagamento esta indisponivel no momento.", opcoes);
  }
}
