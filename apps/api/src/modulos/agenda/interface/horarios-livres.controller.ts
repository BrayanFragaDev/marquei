import { Controller, Get, Query } from "@nestjs/common";
import { Sessao } from "@marquei/dominio";
import { SessaoAtual } from "../../../seguranca/decoradores/sessao-atual";
import { ConsultarHorariosLivres } from "../aplicacao/consultar-horarios-livres";
import {
  entradaDeHorariosLivres,
  horariosLivresParaDto,
  type HorariosLivresDto,
} from "./horarios-livres.dto";

@Controller("v1/horarios-livres")
export class HorariosLivresController {
  constructor(private readonly consultar: ConsultarHorariosLivres) {}

  @Get()
  async listar(
    @SessaoAtual() sessao: Sessao,
    @Query() consulta: unknown,
  ): Promise<HorariosLivresDto> {
    const entrada = entradaDeHorariosLivres(consulta, sessao.tenantObrigatorio());
    return horariosLivresParaDto(await this.consultar.execute(entrada));
  }
}
