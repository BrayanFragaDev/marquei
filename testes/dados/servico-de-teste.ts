interface DadosDoServico {
  readonly id: string;
  readonly estabelecimentoId: string;
  readonly nome: string;
  readonly duracaoEmMinutos: number;
  readonly precoEmCentavos: number;
}

/** Servico fixo de teste. Preco em centavos inteiros (CLAUDE.md, secao 7). */
export class ServicoDeTeste {
  readonly id: string;
  readonly estabelecimentoId: string;
  readonly nome: string;
  readonly duracaoEmMinutos: number;
  readonly precoEmCentavos: number;

  constructor(dados: DadosDoServico) {
    this.id = dados.id;
    this.estabelecimentoId = dados.estabelecimentoId;
    this.nome = dados.nome;
    this.duracaoEmMinutos = dados.duracaoEmMinutos;
    this.precoEmCentavos = dados.precoEmCentavos;
  }
}
