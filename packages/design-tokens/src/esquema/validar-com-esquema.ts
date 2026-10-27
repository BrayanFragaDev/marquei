import type { z } from "zod";
import { TemaInvalidoError } from "../erros/tema-invalido-error";

/** Valida `entrada` e devolve o dado tipado; falha com `TemaInvalidoError` listando os problemas. */
export function validarComEsquema<E extends z.ZodType>(esquema: E, entrada: unknown): z.output<E> {
  const resultado = esquema.safeParse(entrada);
  if (resultado.success) return resultado.data;
  throw new TemaInvalidoError(
    resultado.error.issues.map((p) => ({
      caminho: p.path.map(String).join("."),
      mensagem: p.message,
    })),
  );
}
