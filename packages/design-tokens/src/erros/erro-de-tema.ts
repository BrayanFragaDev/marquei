/**
 * Base dos erros deste pacote. Cada erro tem um `codigo` estavel que a interface
 * mapeia para HTTP/mensagem. Herda apenas um nivel (CLAUDE.md, secao 4).
 *
 * PENDENCIA: quando `ErroDeDominio` existir em `packages/dominio`, esta base deve ser
 * reconciliada com ela (design-tokens pode importar dominio; o inverso e proibido).
 */
export abstract class ErroDeTema extends Error {
  protected constructor(
    readonly codigo: string,
    mensagem: string,
  ) {
    super(mensagem);
    this.name = new.target.name;
  }
}
