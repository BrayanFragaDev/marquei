export const PERIODICIDADES_DE_COBRANCA = ["mensal", "anual"] as const;

export type PeriodicidadeDeCobranca = (typeof PERIODICIDADES_DE_COBRANCA)[number];
