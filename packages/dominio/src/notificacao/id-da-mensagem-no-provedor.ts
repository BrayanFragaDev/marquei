import { IdDoProvedorInvalidoError } from "./id-do-provedor-invalido-error";

const TAMANHO_MAXIMO = 128;

/** Identificador opaco que o provedor devolve para um envio. Sem formato assumido. */
export class IdDaMensagemNoProvedor {
  private constructor(readonly valor: string) {}

  static de(texto: string): IdDaMensagemNoProvedor {
    const limpo = texto.trim();
    if (limpo.length === 0) throw new IdDoProvedorInvalidoError("vazio");
    if (limpo.length > TAMANHO_MAXIMO) throw new IdDoProvedorInvalidoError("longo demais");
    return new IdDaMensagemNoProvedor(limpo);
  }

  igual(outro: IdDaMensagemNoProvedor): boolean {
    return this.valor === outro.valor;
  }

  toString(): string {
    return this.valor;
  }
}
