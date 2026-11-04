import { Instante } from "@marquei/dominio";
import type { Relogio } from "@marquei/dominio";

/** Relogio real (infraestrutura). Testes usam `RelogioFixo`. */
export class RelogioDoSistema implements Relogio {
  agora(): Instante {
    return Instante.deEpochMs(Date.now());
  }
}
