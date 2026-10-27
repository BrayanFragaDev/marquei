import type { EstabelecimentoId } from "../compartilhado/identificador";
import type { Slug } from "./slug";

export interface TemaPublicadoLeitura {
  readonly versao: number;
  readonly tokens: Readonly<Record<string, unknown>>;
}

/** Projecao publica da vitrine: so o que o cliente pode ver antes de entrar. */
export interface EstabelecimentoPublico {
  readonly id: EstabelecimentoId;
  readonly slug: Slug;
  readonly nome: string;
  readonly vertical: string;
  readonly vocabulario: Readonly<Record<string, string>>;
  readonly fusoHorario: string;
  /** `null` enquanto nenhum tema foi publicado. Rascunho nunca aparece aqui. */
  readonly tema: TemaPublicadoLeitura | null;
}
