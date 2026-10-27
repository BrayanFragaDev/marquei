import type { UsuarioId } from "./usuario-id";

/** Porta: o usuario tem o segundo fator (TOTP) ativo? Operador sem 2FA nao recebe sessao. */
export interface VerificadorDeSegundoFator {
  ativoPara(usuarioId: UsuarioId): Promise<boolean>;
}
