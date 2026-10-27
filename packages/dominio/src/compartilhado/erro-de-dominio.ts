/**
 * Base de todos os erros de regra de negocio. O `codigo` e estavel: a camada de interface
 * o usa para mapear status HTTP e mensagem, nunca o texto do erro (CLAUDE.md, secao 7).
 */
export abstract class ErroDeDominio extends Error {
  abstract readonly codigo: string;

  constructor(mensagem: string, opcoes?: ErrorOptions) {
    super(mensagem, opcoes);
    this.name = new.target.name;
  }
}
