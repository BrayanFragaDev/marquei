export const ESTADOS_DA_COBRANCA = ["pendente", "paga", "cancelada"] as const;

export type EstadoDaCobranca = (typeof ESTADOS_DA_COBRANCA)[number];
