import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class DiaCivilInvalidoError extends ErroDeDominio {
  readonly codigo = "dia_civil_invalido";

  constructor(texto: string) {
    super(`Dia invalido: "${texto}". Use o formato AAAA-MM-DD com uma data que exista.`);
  }
}
