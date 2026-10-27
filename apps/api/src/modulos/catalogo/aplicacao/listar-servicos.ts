import type { EstabelecimentoId, Servico, ServicoRepositorio } from "@marquei/dominio";

export interface EntradaDeListarServicos {
  readonly estabelecimentoId: EstabelecimentoId;
}

export class ListarServicos {
  constructor(private readonly dependencias: { readonly servicos: ServicoRepositorio }) {}

  execute(entrada: EntradaDeListarServicos): Promise<readonly Servico[]> {
    return this.dependencias.servicos.listarAtivos(entrada.estabelecimentoId);
  }
}
