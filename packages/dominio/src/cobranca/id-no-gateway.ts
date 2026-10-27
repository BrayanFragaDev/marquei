import { IdNoGatewayInvalidoError } from "./id-no-gateway-invalido-error";

const TAMANHO_MAXIMO = 128;

/** Identificador opaco que o gateway devolve para assinatura ou cobranca. Sem formato assumido. */
export class IdNoGateway {
  private constructor(readonly valor: string) {}

  static de(texto: string): IdNoGateway {
    const limpo = texto.trim();
    if (limpo.length === 0) throw new IdNoGatewayInvalidoError("vazio");
    if (limpo.length > TAMANHO_MAXIMO) throw new IdNoGatewayInvalidoError("longo demais");
    return new IdNoGateway(limpo);
  }

  igual(outro: IdNoGateway): boolean {
    return this.valor === outro.valor;
  }

  toString(): string {
    return this.valor;
  }
}
