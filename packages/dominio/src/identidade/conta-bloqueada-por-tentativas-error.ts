import { ErroDeDominio } from "../compartilhado/erro-de-dominio";
import type { Instante } from "../compartilhado/instante";

export class ContaBloqueadaPorTentativasError extends ErroDeDominio {
  readonly codigo = "conta_bloqueada_por_tentativas";

  constructor(readonly ate: Instante) {
    super("Muitas tentativas. Tente novamente mais tarde.");
  }
}
