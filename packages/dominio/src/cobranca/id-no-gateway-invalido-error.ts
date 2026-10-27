import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class IdNoGatewayInvalidoError extends ErroDeDominio {
  readonly codigo = "id_no_gateway_invalido";

  constructor(motivo: string) {
    super(`Identificador do gateway de pagamento invalido: ${motivo}.`);
  }
}
