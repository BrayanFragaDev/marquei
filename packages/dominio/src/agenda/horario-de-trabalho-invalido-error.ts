import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class HorarioDeTrabalhoInvalidoError extends ErroDeDominio {
  readonly codigo = "horario_de_trabalho_invalido";

  constructor(motivo: string) {
    super(`Horario de trabalho invalido: ${motivo}.`);
  }
}
