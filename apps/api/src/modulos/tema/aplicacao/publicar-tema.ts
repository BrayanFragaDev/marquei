import type { PublicadorDeEventos, Relogio } from "@marquei/dominio";
import {
  RascunhoDeTemaNaoEncontradoError,
  TemaPublicado,
  type AutorDaAlteracao,
  type TemaRepositorio,
  type TemaVersionado,
  type ValidadorDeContraste,
} from "@marquei/design-tokens";

export interface DependenciasDePublicarTema {
  readonly temas: TemaRepositorio;
  readonly validador: ValidadorDeContraste;
  readonly eventos: PublicadorDeEventos;
  readonly relogio: Relogio;
}

/**
 * Publica o rascunho: exige WCAG AA (erro de dominio com sugestoes se reprovar, sem tocar no
 * publicado) e emite `tema_publicado`. Roda na transacao da requisicao: publicado e evento
 * entram juntos ou nenhum dos dois.
 */
export class PublicarTema {
  constructor(private readonly deps: DependenciasDePublicarTema) {}

  async execute(entrada: { readonly autor: AutorDaAlteracao }): Promise<TemaVersionado> {
    const { temas, validador, eventos, relogio } = this.deps;
    const { autor } = entrada;
    const rascunho = await temas.obterRascunho(autor.estabelecimentoId);
    if (!rascunho) throw new RascunhoDeTemaNaoEncontradoError();
    rascunho.tema.validarParaPublicacao(validador);
    const agora = relogio.agora();
    const publicado = await temas.publicar(autor.estabelecimentoId, rascunho.tema, agora);
    await eventos.publicar(
      new TemaPublicado({
        autor,
        ocorridoEm: agora,
        versao: publicado.versao,
        contrasteMinimo: validador.menorRazao(rascunho.tema),
      }),
    );
    return publicado;
  }
}
