import type { EstabelecimentoId } from "../compartilhado/identificador";
import type { Slug } from "./slug";

/**
 * Tipo de leitura (projecao) do estabelecimento com a configuracao de agenda. O tema publicado
 * pertence a `packages/design-tokens` e e acrescentado na borda (`EstabelecimentoPublico`).
 */
export interface EstabelecimentoLeitura {
  readonly id: EstabelecimentoId;
  readonly slug: Slug;
  readonly nome: string;
  /** Fuso IANA usado so na apresentacao e na agenda diaria. */
  readonly fusoHorario: string;
  readonly vertical: string;
  /** Distancia entre inicios de horarios oferecidos, em minutos. */
  readonly passoDaAgendaMinutos: number;
  /** Antecedencia minima para o cliente cancelar ou remarcar, em minutos. */
  readonly antecedenciaDeCancelamentoMinutos: number;
}
