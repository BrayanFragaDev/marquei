import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class SegundoFatorObrigatorioError extends ErroDeDominio {
  readonly codigo = "segundo_fator_obrigatorio";

  constructor() {
    super("O operador da plataforma precisa ter o segundo fator ativo.");
  }
}
