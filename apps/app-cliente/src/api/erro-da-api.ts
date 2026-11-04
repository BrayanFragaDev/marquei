/** Falha de chamada à API com o `codigo` estável do contrato (ou `rede_indisponivel`). */
export class ErroDaApi extends Error {
  constructor(
    readonly codigo: string,
    readonly status: number,
  ) {
    super(codigo);
    this.name = "ErroDaApi";
  }
}

export const CODIGO_REDE_INDISPONIVEL = "rede_indisponivel";
