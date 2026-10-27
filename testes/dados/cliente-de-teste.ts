/** Cliente final fixo de teste. Telefone ficticio, reservado para exemplos. */
export class ClienteDeTeste {
  constructor(
    readonly id: string,
    readonly estabelecimentoId: string,
    readonly nome: string,
    readonly telefone: string,
  ) {}
}
