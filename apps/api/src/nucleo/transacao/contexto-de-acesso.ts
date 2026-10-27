import type { EstabelecimentoId } from "@marquei/dominio";

/** Quem acessa o banco: um tenant (app_usuario) ou o operador da plataforma. */
export type ContextoDeAcesso =
  | { readonly papel: "app_usuario"; readonly tenant: EstabelecimentoId }
  | { readonly papel: "app_plataforma" };
