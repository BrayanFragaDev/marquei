import type { SenhaEmTexto } from "./senha-em-texto";

/** Porta do algoritmo de hash (argon2id na infraestrutura). */
export interface HashDeSenha {
  hash(senha: SenhaEmTexto): Promise<string>;
  /** Hash malformado ou de outro formato resulta em `false`, nunca em excecao. */
  verificar(senha: SenhaEmTexto, hash: string): Promise<boolean>;
}
