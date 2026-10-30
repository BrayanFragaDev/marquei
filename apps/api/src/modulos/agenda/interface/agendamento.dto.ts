import { BadRequestException } from "@nestjs/common";
import {
  Instante,
  ProfissionalId,
  ServicoId,
  type Agendamento,
  type ClienteFinalId,
  type EstabelecimentoId,
} from "@marquei/dominio";
import type { EntradaDeCriarAgendamento } from "../aplicacao/criar-agendamento";

export interface AgendamentoDto {
  id: string;
  servicoId: string;
  profissionalId: string;
  inicio: string;
  fim: string;
  status: string;
  precoCentavos: number;
}

function corpoComoRegistro(corpo: unknown): Record<string, unknown> {
  if (typeof corpo !== "object" || corpo === null || Array.isArray(corpo)) {
    throw new BadRequestException({ codigo: "requisicao_invalida", mensagem: "Corpo invalido." });
  }
  return corpo as Record<string, unknown>;
}

function campoTexto(dados: Record<string, unknown>, campo: string): string {
  const valor = dados[campo];
  if (typeof valor !== "string") {
    throw new BadRequestException({
      codigo: "requisicao_invalida",
      mensagem: "Corpo invalido.",
      detalhes: [{ campo, codigo: "obrigatorio" }],
    });
  }
  return valor;
}

/**
 * Valida o corpo na borda e o converte em objetos de valor. Estabelecimento e cliente vem da
 * sessao (token), nunca do corpo.
 */
export function entradaDeCriarAgendamento(
  corpo: unknown,
  quem: { estabelecimentoId: EstabelecimentoId; clienteId: ClienteFinalId },
): EntradaDeCriarAgendamento {
  const dados = corpoComoRegistro(corpo);
  return {
    estabelecimentoId: quem.estabelecimentoId,
    clienteId: quem.clienteId,
    servicoId: ServicoId.de(campoTexto(dados, "servicoId")),
    profissionalId: ProfissionalId.de(campoTexto(dados, "profissionalId")),
    inicio: Instante.deIso(campoTexto(dados, "inicio")),
    canal: "app",
  };
}

export function agendamentoParaDto(a: Agendamento): AgendamentoDto {
  return {
    id: a.id.valor,
    servicoId: a.servicoId.valor,
    profissionalId: a.profissionalId.valor,
    inicio: a.janela.inicio.paraIso(),
    fim: a.janela.fim.paraIso(),
    status: a.status,
    precoCentavos: a.preco.centavos,
  };
}
