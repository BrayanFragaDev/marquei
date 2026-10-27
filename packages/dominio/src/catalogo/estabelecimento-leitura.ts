import type { EstabelecimentoId } from "../compartilhado/identificador";
import type { Slug } from "./slug";

/**
 * Tipo de leitura (projecao) do estabelecimento. O tema publicado pertence a
 * `packages/design-tokens` e e acrescentado na borda (caso de uso/DTO), nao aqui.
 */
export interface EstabelecimentoLeitura {
  readonly id: EstabelecimentoId;
  readonly slug: Slug;
  readonly nome: string;
  /** Fuso IANA usado so na apresentacao e na agenda diaria. */
  readonly fusoHorario: string;
  readonly vertical: string;
}
