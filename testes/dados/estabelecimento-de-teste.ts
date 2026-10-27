/** Estabelecimento fixo usado nos testes. Sem logica de negocio: so dados imutaveis. */
export class EstabelecimentoDeTeste {
  constructor(
    readonly id: string,
    readonly nome: string,
    readonly slug: string,
    readonly fusoHorario: string,
  ) {}
}
