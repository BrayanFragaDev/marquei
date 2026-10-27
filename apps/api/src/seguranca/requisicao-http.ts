import type { Sessao } from "@marquei/dominio";

/** Visao minima da requisicao HTTP (Express) usada pela camada de seguranca. */
export interface RequisicaoHttp {
  readonly headers: Readonly<Record<string, string | string[] | undefined>>;
  readonly body?: unknown;
  readonly query?: unknown;
  readonly params?: Readonly<Record<string, unknown>>;
  /** Preenchida somente pelo guard, a partir do token verificado. */
  sessao?: Sessao;
}

export interface RespostaHttp {
  status(codigo: number): RespostaHttp;
  json(corpo: unknown): unknown;
}
