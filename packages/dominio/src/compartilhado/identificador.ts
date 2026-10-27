import { IdentificadorInvalidoError } from "./identificador-invalido-error";

const PADRAO_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/**
 * Identificador (UUID) com tipo nominal: `Identificador<"servico">` nao e aceito onde se
 * espera `Identificador<"profissional">`, mesmo sendo ambos texto por baixo. Um unico tipo
 * generico evita heranca e repeticao (CLAUDE.md, secao 4).
 */
export class Identificador<Marca extends string> {
  /** Apenas para o compilador distinguir marcas; nao existe em tempo de execucao. */
  declare private readonly marca: Marca;

  private constructor(readonly valor: string) {}

  /** `rotulo` aparece na mensagem de erro (ex.: "agendamento"). */
  static de<M extends string>(texto: string, rotulo: M): Identificador<M> {
    if (!PADRAO_UUID.test(texto)) throw new IdentificadorInvalidoError(rotulo);
    return new Identificador<M>(texto.toLowerCase());
  }

  igual(outro: Identificador<Marca>): boolean {
    return this.valor === outro.valor;
  }

  toString(): string {
    return this.valor;
  }
}

export type EstabelecimentoId = Identificador<"estabelecimento">;

export const EstabelecimentoId = {
  de: (texto: string): EstabelecimentoId => Identificador.de(texto, "estabelecimento"),
};
