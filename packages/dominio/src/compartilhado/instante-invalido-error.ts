import { ErroDeDominio } from "./erro-de-dominio";

export class InstanteInvalidoError extends ErroDeDominio {
  readonly codigo = "instante_invalido";

  constructor(entrada: string) {
    super(`Instante invalido: ${entrada}. Use ISO 8601 em UTC (ex.: 2026-10-27T11:00:00Z).`);
  }
}
