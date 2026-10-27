import { ErroDeDominio } from "../compartilhado/erro-de-dominio";
import type { CanalDeMensagem } from "./canal-de-mensagem";

export class CanalNaoSuportadoError extends ErroDeDominio {
  readonly codigo = "canal_nao_suportado";

  constructor(readonly canal: CanalDeMensagem) {
    super(`O provedor de mensagem nao suporta o canal ${canal}.`);
  }
}
