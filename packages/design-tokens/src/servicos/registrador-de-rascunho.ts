import type { PublicadorDeEventos, Relogio } from "@marquei/dominio";
import type { AutorDaAlteracao } from "../autoria/autor-da-alteracao";
import { TemaRascunhoSalvo } from "../eventos/tema-rascunho-salvo";
import type { TemaRepositorio } from "../persistencia/tema-repositorio";
import type { TemaVersionado } from "../persistencia/tema-versionado";
import type { TemaDoEstabelecimento } from "../tema/tema-do-estabelecimento";

/**
 * Grava o rascunho e registra `tema_rascunho_salvo` com os campos que mudaram em relacao ao que
 * o editor tinha na mao (o rascunho anterior, ou o publicado). Rascunho aceita contraste ruim:
 * so a publicacao exige AA. Nao altera o publicado.
 */
export class RegistradorDeRascunho {
  constructor(
    private readonly temas: TemaRepositorio,
    private readonly eventos: PublicadorDeEventos,
    private readonly relogio: Relogio,
  ) {}

  async registrar(autor: AutorDaAlteracao, tema: TemaDoEstabelecimento): Promise<TemaVersionado> {
    const estabelecimento = autor.estabelecimentoId;
    const anterior =
      (await this.temas.obterRascunho(estabelecimento)) ??
      (await this.temas.obterPublicado(estabelecimento));
    const agora = this.relogio.agora();
    const salvo = await this.temas.salvarRascunho(estabelecimento, tema, agora);
    await this.eventos.publicar(
      new TemaRascunhoSalvo({
        autor,
        ocorridoEm: agora,
        versao: salvo.versao,
        camposAlterados: tema.camposAlteradosEm(anterior?.tema ?? null),
      }),
    );
    return salvo;
  }
}
