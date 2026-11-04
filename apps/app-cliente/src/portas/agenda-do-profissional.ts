export interface ItemDaAgenda {
  readonly id: string;
  readonly inicio: string;
  readonly fim: string;
  readonly nomeDoServico: string;
  readonly status: "confirmado" | "concluido" | "cancelado";
}

/**
 * Agenda do dia do profissional e conclusão do atendimento.
 * PENDENCIA: o OpenAPI não tem listagem da agenda do dia nem `concluir`. Só adaptador simulado.
 */
export interface AgendaDoProfissional {
  doDia(dia: string): Promise<readonly ItemDaAgenda[]>;
  concluir(id: string): Promise<ItemDaAgenda>;
}
