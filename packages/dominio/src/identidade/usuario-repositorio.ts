import type { EstabelecimentoId } from "../compartilhado/identificador";
import type { Email } from "./email";
import type { Usuario } from "./usuario";

/** Porta de leitura de usuarios. Sempre dentro de uma transacao do tenant (RLS). */
export interface UsuarioRepositorio {
  obterPorEmail(estabelecimentoId: EstabelecimentoId, email: Email): Promise<Usuario | null>;
}
