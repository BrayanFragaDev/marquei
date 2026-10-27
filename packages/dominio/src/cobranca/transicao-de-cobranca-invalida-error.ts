import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class TransicaoDeCobrancaInvalidaError extends ErroDeDominio {
  readonly codigo = "transicao_de_cobranca_invalida";

  constructor(de: string, para: string) {
    super(`Uma cobranca ${de} nao pode passar para ${para}.`);
  }
}
