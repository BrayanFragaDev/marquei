import { ErroDeDominio } from "@marquei/dominio";

export class VersaoDeTemaInvalidaError extends ErroDeDominio {
  readonly codigo = "versao_de_tema_invalida";

  constructor(readonly versao: number) {
    super(`Versao de tema invalida: ${versao}. Use um inteiro maior ou igual a zero.`);
  }
}
