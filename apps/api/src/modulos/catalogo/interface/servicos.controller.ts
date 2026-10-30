import { Controller, Get } from "@nestjs/common";
import { Sessao } from "@marquei/dominio";
import { SessaoAtual } from "../../../seguranca/decoradores/sessao-atual";
import { ListarServicos } from "../aplicacao/listar-servicos";
import { servicoParaDto, type ServicoDto } from "./servico.dto";

@Controller("v1/servicos")
export class ServicosController {
  constructor(private readonly listar: ListarServicos) {}

  @Get()
  async listarServicos(@SessaoAtual() sessao: Sessao): Promise<{ itens: ServicoDto[] }> {
    const servicos = await this.listar.execute({ estabelecimentoId: sessao.tenantObrigatorio() });
    return { itens: servicos.map(servicoParaDto) };
  }
}
