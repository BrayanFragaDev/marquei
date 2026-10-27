import type { EstabelecimentoPublico } from "@marquei/dominio";

export interface EstabelecimentoPublicoDto {
  id: string;
  slug: string;
  nome: string;
  vertical: string;
  vocabulario: Record<string, string>;
  fusoHorario: string;
  tema: { versao: number; tokens: Record<string, unknown> } | null;
}

/** Mapeia a projecao publica para o DTO do contrato (nunca devolve estruturas do banco). */
export function estabelecimentoParaDto(e: EstabelecimentoPublico): EstabelecimentoPublicoDto {
  return {
    id: e.id.valor,
    slug: e.slug.valor,
    nome: e.nome,
    vertical: e.vertical,
    vocabulario: { ...e.vocabulario },
    fusoHorario: e.fusoHorario,
    tema: e.tema ? { versao: e.tema.versao, tokens: { ...e.tema.tokens } } : null,
  };
}
