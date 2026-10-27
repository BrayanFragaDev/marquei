import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export class HorarioIndisponivelError extends ErroDeDominio {
  readonly codigo = "horario_indisponivel";

  constructor() {
    super("Este horario nao esta mais disponivel. Escolha outro.");
  }
}
