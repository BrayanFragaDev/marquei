import { Controller, Get, UseFilters } from "@nestjs/common";
import { AutorDaAlteracao, catalogoDeOpcoes } from "@marquei/design-tokens";
import type { Sessao } from "@marquei/dominio";
import { SessaoAtual } from "../../../seguranca/decoradores/sessao-atual";
import { ObterRascunho } from "../aplicacao/obter-rascunho";
import { ObterTemaPublicado } from "../aplicacao/obter-tema-publicado";
import { FiltroDeErrosDeTema } from "./filtro-de-erros-de-tema";
import { paraRespostaDeTema, type RespostaDeOpcoes, type RespostaDeTema } from "./tema.dto";

/**
 * Leitura do tema do estabelecimento da sessao. O tenant vem sempre do token (o interceptor
 * rejeita qualquer tenant informado pelo cliente). O publicado e legivel por qualquer sessao do
 * estabelecimento; o rascunho so por dono/gestor e nunca chega ao cliente final.
 */
@Controller("v1/tema")
@UseFilters(FiltroDeErrosDeTema)
export class TemaController {
  constructor(
    private readonly obterPublicado: ObterTemaPublicado,
    private readonly obterRascunho: ObterRascunho,
  ) {}

  @Get()
  async publicado(@SessaoAtual() sessao: Sessao): Promise<RespostaDeTema> {
    const estabelecimentoId = sessao.tenantObrigatorio();
    return paraRespostaDeTema(await this.obterPublicado.execute({ estabelecimentoId }));
  }

  @Get("opcoes")
  opcoes(): RespostaDeOpcoes {
    return catalogoDeOpcoes();
  }

  @Get("rascunho")
  async rascunho(@SessaoAtual() sessao: Sessao): Promise<RespostaDeTema> {
    const autor = AutorDaAlteracao.deSessao(sessao);
    return paraRespostaDeTema(await this.obterRascunho.execute({ autor }));
  }
}
