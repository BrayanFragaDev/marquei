export const IDS_DE_DENSIDADE = ["compacta", "confortavel"] as const;
export type IdDeDensidade = (typeof IDS_DE_DENSIDADE)[number];

/** Espacamentos e altura de campo em pixels (iguais em web e mobile). */
export interface EscalaDeEspacamento {
  readonly xs: number;
  readonly sm: number;
  readonly md: number;
  readonly lg: number;
  readonly xl: number;
  readonly alturaDoCampo: number;
}

export const ESCALAS_DE_ESPACAMENTO: Readonly<Record<IdDeDensidade, EscalaDeEspacamento>> = {
  compacta: { xs: 2, sm: 6, md: 12, lg: 16, xl: 24, alturaDoCampo: 40 },
  confortavel: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, alturaDoCampo: 48 },
};
