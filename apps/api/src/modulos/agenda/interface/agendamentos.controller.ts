import { Body, Controller, HttpCode, Param, Post } from "@nestjs/common";
import { AgendamentoId, Sessao, SolicitanteDeAgendamento } from "@marquei/dominio";
import { SessaoAtual } from "../../../seguranca/decoradores/sessao-atual";
import { CancelarAgendamento } from "../aplicacao/cancelar-agendamento";
import { CriarAgendamento } from "../aplicacao/criar-agendamento";
import {
  agendamentoParaDto,
  entradaDeCriarAgendamento,
  type AgendamentoDto,
} from "./agendamento.dto";

@Controller("v1/agendamentos")
export class AgendamentosController {
  constructor(
    private readonly criar: CriarAgendamento,
    private readonly cancelar: CancelarAgendamento,
  ) {}

  @HttpCode(201)
  @Post()
  async criarAgendamento(
    @SessaoAtual() sessao: Sessao,
    @Body() corpo: unknown,
  ): Promise<AgendamentoDto> {
    const quem = SolicitanteDeAgendamento.de(sessao.papel, sessao.usuarioId);
    const entrada = entradaDeCriarAgendamento(corpo, {
      estabelecimentoId: sessao.tenantObrigatorio(),
      clienteId: quem.clienteQueAgenda(),
    });
    return agendamentoParaDto(await this.criar.execute(entrada));
  }

  @HttpCode(200)
  @Post(":id/cancelar")
  async cancelarAgendamento(
    @SessaoAtual() sessao: Sessao,
    @Param("id") id: string,
  ): Promise<AgendamentoDto> {
    const quem = SolicitanteDeAgendamento.de(sessao.papel, sessao.usuarioId);
    const cancelado = await this.cancelar.execute({
      estabelecimentoId: sessao.tenantObrigatorio(),
      agendamentoId: AgendamentoId.de(id),
      ator: quem.ator(),
    });
    return agendamentoParaDto(cancelado);
  }
}
