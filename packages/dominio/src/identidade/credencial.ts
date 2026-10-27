import type { HashDeSenha } from "./hash-de-senha";
import type { SenhaEmTexto } from "./senha-em-texto";

/** Prova de identidade guardada: somente o hash da senha, nunca a senha. */
export class Credencial {
  private constructor(private readonly hash: string) {}

  static async criar(senha: SenhaEmTexto, hasher: HashDeSenha): Promise<Credencial> {
    return new Credencial(await hasher.hash(senha));
  }

  static reconstituir(hashArmazenado: string): Credencial {
    return new Credencial(hashArmazenado);
  }

  verificar(tentativa: SenhaEmTexto, hasher: HashDeSenha): Promise<boolean> {
    return hasher.verificar(tentativa, this.hash);
  }

  /** Para persistir. O hash nao aparece em JSON nem em log. */
  paraArmazenar(): string {
    return this.hash;
  }

  toJSON(): string {
    return "[credencial oculta]";
  }

  toString(): string {
    return "[credencial oculta]";
  }
}
