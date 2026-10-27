/** Verticais com tema inicial (produto.md, secao 3). */
export const VERTICAIS = ["manicure", "cabeleireiro", "barbearia", "estetica", "outro"] as const;
export type Vertical = (typeof VERTICAIS)[number];

/** Slug de vertical do banco -> vertical com tema inicial; desconhecida cai em `outro`. */
export function verticalOuPadrao(slug: string): Vertical {
  return VERTICAIS.find((v) => v === slug) ?? "outro";
}
