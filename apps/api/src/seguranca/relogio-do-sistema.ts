import { Instante, type Relogio } from "@marquei/dominio";

/** Unica fonte da hora real na camada de seguranca; o dominio so recebe `Relogio`. */
export class RelogioDoSistema implements Relogio {
  agora(): Instante {
    return Instante.deEpochMs(Date.now());
  }
}
