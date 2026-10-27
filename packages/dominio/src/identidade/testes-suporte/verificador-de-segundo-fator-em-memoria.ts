import type { UsuarioId } from "../usuario-id";
import type { VerificadorDeSegundoFator } from "../verificador-de-segundo-fator";

/** Fake ate existir o 2FA TOTP real: ninguem tem 2FA ativo a menos que seja registrado. */
export class VerificadorDeSegundoFatorEmMemoria implements VerificadorDeSegundoFator {
  private readonly ativos = new Set<string>();

  ativarPara(usuarioId: UsuarioId): void {
    this.ativos.add(usuarioId.valor);
  }

  ativoPara(usuarioId: UsuarioId): Promise<boolean> {
    return Promise.resolve(this.ativos.has(usuarioId.valor));
  }
}
