export const IDS_DE_RAIO = ["reto", "suave", "arredondado"] as const;
export type IdDeRaio = (typeof IDS_DE_RAIO)[number];

/** Raios de canto em pixels (iguais em web e mobile). */
export interface EscalaDeRaio {
  readonly campo: number;
  readonly botao: number;
  readonly cartao: number;
}

export const ESCALAS_DE_RAIO: Readonly<Record<IdDeRaio, EscalaDeRaio>> = {
  reto: { campo: 0, botao: 0, cartao: 0 },
  suave: { campo: 6, botao: 8, cartao: 12 },
  arredondado: { campo: 12, botao: 999, cartao: 24 },
};
