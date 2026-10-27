/** Verticais com tema inicial (produto.md, secao 3). */
export const VERTICAIS = ["manicure", "cabeleireiro", "barbearia", "estetica", "outro"] as const;
export type Vertical = (typeof VERTICAIS)[number];
