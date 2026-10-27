import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class SlugInvalidoError extends ErroDeDominio {
  readonly codigo = "slug_invalido";

  constructor(texto: string) {
    super(`Slug invalido: "${texto}". Use 3 a 63 letras minusculas, numeros e hifens.`);
  }
}
