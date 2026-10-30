import type { DadosDoTema, OpcoesCuradas, OrigemDoTema, TemaLido } from "@marquei/design-tokens";
import type { TemaVersionado } from "@marquei/design-tokens";

export interface RespostaDeTema {
  readonly versao: number;
  readonly atualizadoEm: string | null;
  readonly origem: OrigemDoTema;
  readonly tokens: DadosDoTema;
}

/** Mapeia o tema de dominio para o DTO da API: nunca devolve a linha do banco. */
export function paraRespostaDeTema(lido: TemaLido): RespostaDeTema {
  const { versionado, origem } = lido;
  return {
    versao: versionado.versao,
    atualizadoEm: versionado.atualizadoEm?.paraIso() ?? null,
    origem,
    tokens: versionado.tema.paraDados(),
  };
}

export function paraRespostaDeTemaSalvo(
  versionado: TemaVersionado,
  origem: OrigemDoTema,
): RespostaDeTema {
  return paraRespostaDeTema({ versionado, origem });
}

export type RespostaDeOpcoes = OpcoesCuradas;
