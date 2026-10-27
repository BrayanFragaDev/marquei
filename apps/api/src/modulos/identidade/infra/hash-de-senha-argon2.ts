import argon2 from "argon2";
import type { HashDeSenha, SenhaEmTexto } from "@marquei/dominio";

/** Parametros minimos recomendados pela OWASP para argon2id: 19 MiB, 2 iteracoes, 1 thread. */
const OPCOES = { type: argon2.argon2id, memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const;

export class HashDeSenhaArgon2 implements HashDeSenha {
  hash(senha: SenhaEmTexto): Promise<string> {
    return argon2.hash(senha.revelar(), OPCOES);
  }

  async verificar(senha: SenhaEmTexto, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, senha.revelar());
    } catch {
      // Hash malformado/legado: trata como nao confere, sem vazar o motivo.
      return false;
    }
  }
}
