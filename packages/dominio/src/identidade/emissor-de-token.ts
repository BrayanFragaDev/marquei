import type { Instante } from "../compartilhado/instante";
import type { Sessao } from "./sessao";

export interface TokenEmitido {
  readonly token: string;
  readonly expiraEm: Instante;
}

/**
 * Porta de emissao e verificacao de tokens de sessao. Cada instancia serve a UMA audiencia
 * (segredo proprio); `verificar` recusa token de outra audiencia, assinatura ruim ou expirado.
 */
export interface EmissorDeToken {
  emitir(sessao: Sessao): Promise<TokenEmitido>;
  verificar(token: string): Promise<Sessao>;
}
