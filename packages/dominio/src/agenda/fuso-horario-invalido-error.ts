import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class FusoHorarioInvalidoError extends ErroDeDominio {
  readonly codigo = "fuso_horario_invalido";

  constructor(nome: string) {
    super(`Fuso horario invalido: "${nome}". Use um nome IANA, como America/Sao_Paulo.`);
  }
}
