import { vi } from "vitest";

/** Estado compartilhado do `next/navigation` falso (ver test/configuracao.tsx). */
export const navegacao = {
  push: vi.fn(),
  replace: vi.fn(),
  parametros: new URLSearchParams(),
  caminho: "/",
};

export function definirParametros(consulta: string): void {
  navegacao.parametros = new URLSearchParams(consulta);
}
