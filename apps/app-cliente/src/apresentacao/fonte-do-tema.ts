import type { FamiliaTipografica } from "@marquei/design-tokens";

/** Endereço da folha de estilos da família curada do tema; a pilha CSS já tem fallback genérico. */
export function urlDaFonteDoTema(familia: FamiliaTipografica): string {
  const nome = familia.nome.trim().replace(/\s+/g, "+");
  return `https://fonts.googleapis.com/css2?family=${nome}:wght@400;600;700&display=swap`;
}
