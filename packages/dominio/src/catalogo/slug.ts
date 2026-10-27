import { SlugInvalidoError } from "./slug-invalido-error";

const PADRAO_SLUG = /^[a-z0-9](?:[a-z0-9-]{1,61})[a-z0-9]$/;

/** Identificador publico e legivel do estabelecimento (parte da URL). Minusculas, numeros e hifens. */
export class Slug {
  private constructor(readonly valor: string) {}

  static de(texto: string): Slug {
    if (!PADRAO_SLUG.test(texto) || texto.includes("--")) throw new SlugInvalidoError(texto);
    return new Slug(texto);
  }

  igual(outro: Slug): boolean {
    return this.valor === outro.valor;
  }

  toString(): string {
    return this.valor;
  }
}
