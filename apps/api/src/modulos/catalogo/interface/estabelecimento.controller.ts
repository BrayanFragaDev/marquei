import { Controller, Get, Param } from "@nestjs/common";
import { Slug } from "@marquei/dominio";
import { Publica } from "../../../seguranca/decoradores/publica";
import { ObterEstabelecimentoPorSlug } from "../aplicacao/obter-estabelecimento-por-slug";
import { estabelecimentoParaDto, type EstabelecimentoPublicoDto } from "./estabelecimento.dto";

@Controller("v1/estabelecimentos")
export class EstabelecimentoController {
  constructor(private readonly obter: ObterEstabelecimentoPorSlug) {}

  /** Unica rota que recebe o slug: resolve a marca ANTES de existir sessao. */
  @Publica()
  @Get(":slug")
  async porSlug(@Param("slug") slug: string): Promise<EstabelecimentoPublicoDto> {
    const encontrado = await this.obter.execute({ slug: Slug.de(slug) });
    return estabelecimentoParaDto(encontrado);
  }
}
