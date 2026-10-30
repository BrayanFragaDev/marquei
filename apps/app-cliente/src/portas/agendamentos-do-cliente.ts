import type { Agendamento } from "../api/gateway-da-api";

/**
 * Lista dos agendamentos do cliente.
 * PENDENCIA: o OpenAPI não tem `GET /v1/agendamentos` (do cliente autenticado). Até lá o
 * adaptador local lembra no aparelho o que o próprio cliente agendou nesta sessão de navegador.
 */
export interface AgendamentosDoCliente {
  listar(slug: string): readonly Agendamento[];
  registrar(slug: string, agendamento: Agendamento): void;
  atualizar(slug: string, agendamento: Agendamento): void;
}
