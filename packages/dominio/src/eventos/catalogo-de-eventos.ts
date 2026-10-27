import type { AgendamentoCancelado } from "./agendamento-cancelado";
import type { AgendamentoCriado } from "./agendamento-criado";
import type { AgendamentoRemarcado } from "./agendamento-remarcado";
import type { AtendimentoConcluido } from "./atendimento-concluido";
import type { EstabelecimentoCriado } from "./estabelecimento-criado";

/** Catalogo unico dos eventos de negocio emitidos por BN (plano.md, secao 7). */
export type EventoDeNegocioDeBn =
  | AgendamentoCriado
  | AgendamentoCancelado
  | AgendamentoRemarcado
  | AtendimentoConcluido
  | EstabelecimentoCriado;

export const NOMES_DOS_EVENTOS_DE_NEGOCIO = [
  "agendamento_criado",
  "agendamento_cancelado",
  "agendamento_remarcado",
  "atendimento_concluido",
  "estabelecimento_criado",
] as const satisfies readonly EventoDeNegocioDeBn["nome"][];
