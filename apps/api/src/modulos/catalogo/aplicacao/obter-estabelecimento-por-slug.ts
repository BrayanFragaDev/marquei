import {
  EstabelecimentoNaoEncontradoError,
  type EstabelecimentoPublico,
  type EstabelecimentoPublicoRepositorio,
  type Slug,
} from "@marquei/dominio";

export interface EntradaDeObterEstabelecimentoPorSlug {
  readonly slug: Slug;
}

/** Vitrine publica: dados de marca e tema PUBLICADO (nunca rascunho) de um estabelecimento ativo. */
export class ObterEstabelecimentoPorSlug {
  constructor(
    private readonly dependencias: { readonly estabelecimentos: EstabelecimentoPublicoRepositorio },
  ) {}

  async execute(entrada: EntradaDeObterEstabelecimentoPorSlug): Promise<EstabelecimentoPublico> {
    const achado = await this.dependencias.estabelecimentos.obterPorSlug(entrada.slug);
    if (!achado) throw new EstabelecimentoNaoEncontradoError();
    return achado;
  }
}
