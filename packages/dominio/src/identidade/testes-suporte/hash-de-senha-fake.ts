import type { HashDeSenha } from "../hash-de-senha";
import type { SenhaEmTexto } from "../senha-em-texto";

/** Hash deterministico e instantaneo para testes. NAO e seguro: nunca use fora de testes. */
export class HashDeSenhaFake implements HashDeSenha {
  hash(senha: SenhaEmTexto): Promise<string> {
    return Promise.resolve(
      `fake$${Array.from(senha.revelar(), (c) => (c.codePointAt(0) ?? 0).toString(16)).join("-")}`,
    );
  }

  async verificar(senha: SenhaEmTexto, hash: string): Promise<boolean> {
    return (await this.hash(senha)) === hash;
  }
}
