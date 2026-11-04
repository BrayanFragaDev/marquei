/** Resultado serializavel de uma acao de formulario (Server Action). */
export type EstadoDaAcao =
  | { readonly status: "inicial" }
  | { readonly status: "ok"; readonly mensagem: string }
  | { readonly status: "erro"; readonly mensagem: string };

export const ESTADO_INICIAL: EstadoDaAcao = { status: "inicial" };
