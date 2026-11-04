import type { CSSProperties, ReactNode } from "react";

export interface PropriedadesDoEscopoDeTema {
  /** Mapa `--nome` para valor (`paraVariaveisCss(tema).variaveis`). */
  readonly variaveis: Readonly<Record<string, string>>;
  readonly children: ReactNode;
}

/** Aplica as variaveis do tema a uma subarvore (pre-visualizacao do console, rascunho). */
export function EscopoDeTema({ variaveis, children }: PropriedadesDoEscopoDeTema) {
  return <div style={variaveis as CSSProperties}>{children}</div>;
}
