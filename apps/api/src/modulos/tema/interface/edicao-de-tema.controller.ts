import { Body, Controller, HttpCode, Post, Put, UseFilters } from "@nestjs/common";
import { AutorDaAlteracao, TemaDoEstabelecimento } from "@marquei/design-tokens";
import type { Sessao } from "@marquei/dominio";
import { SessaoAtual } from "../../../seguranca/decoradores/sessao-atual";
import { PublicarTema } from "../aplicacao/publicar-tema";
import { RestaurarTemaPadraoDaVertical } from "../aplicacao/restaurar-tema-padrao-da-vertical";
import { SalvarRascunhoDoTema } from "../aplicacao/salvar-rascunho-do-tema";
import { FiltroDeErrosDeTema } from "./filtro-de-erros-de-tema";
import { paraRespostaDeTemaSalvo, type RespostaDeTema } from "./tema.dto";

/**
 * Alteracao do tema: so dono ou gestor (a permissao e checada antes de ler o corpo). O tenant
 * vem do token. Salvar e restaurar mexem apenas no rascunho; so `publicar` altera o que o
 * cliente ve.
 */
@Controller("v1/tema")
@UseFilters(FiltroDeErrosDeTema)
export class EdicaoDeTemaController {
  constructor(
    private readonly salvarRascunho: SalvarRascunhoDoTema,
    private readonly restaurarPadrao: RestaurarTemaPadraoDaVertical,
    private readonly publicarTema: PublicarTema,
  ) {}

  @Put("rascunho")
  async salvar(@SessaoAtual() sessao: Sessao, @Body() corpo: unknown): Promise<RespostaDeTema> {
    const autor = AutorDaAlteracao.deSessao(sessao);
    const tema = TemaDoEstabelecimento.criar(corpo);
    return paraRespostaDeTemaSalvo(await this.salvarRascunho.execute({ autor, tema }), "rascunho");
  }

  @HttpCode(200)
  @Post("rascunho/restaurar-padrao")
  async restaurar(@SessaoAtual() sessao: Sessao): Promise<RespostaDeTema> {
    const autor = AutorDaAlteracao.deSessao(sessao);
    return paraRespostaDeTemaSalvo(await this.restaurarPadrao.execute({ autor }), "rascunho");
  }

  @HttpCode(200)
  @Post("publicar")
  async publicar(@SessaoAtual() sessao: Sessao): Promise<RespostaDeTema> {
    const autor = AutorDaAlteracao.deSessao(sessao);
    return paraRespostaDeTemaSalvo(await this.publicarTema.execute({ autor }), "publicado");
  }
}
