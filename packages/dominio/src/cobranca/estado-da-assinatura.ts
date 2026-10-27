/** Visao do gateway. Carencia e bloqueio de recursos sao regras do Agendai, nao daqui. */
export const ESTADOS_DA_ASSINATURA = ["pendente", "ativa", "em_atraso", "cancelada"] as const;

export type EstadoDaAssinatura = (typeof ESTADOS_DA_ASSINATURA)[number];
