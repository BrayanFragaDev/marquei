import { BadRequestException } from "@nestjs/common";
import { Email, SenhaEmTexto, Slug } from "@marquei/dominio";
import type { EntradaDeLogin } from "../aplicacao/login-por-email-e-senha";

/**
 * Valida o corpo do login na borda e o converte em objetos de valor. O campo `estabelecimento`
 * e o SLUG publico; o tenant (id) e resolvido no servidor e nunca aceito do cliente.
 */
export function entradaDeLoginDoCorpo(corpo: unknown): EntradaDeLogin {
  const dados = (typeof corpo === "object" && corpo !== null ? corpo : {}) as Record<
    string,
    unknown
  >;
  const { estabelecimento, email, senha } = dados;
  if (
    typeof estabelecimento !== "string" ||
    typeof email !== "string" ||
    typeof senha !== "string"
  ) {
    throw new BadRequestException({ codigo: "requisicao_invalida", mensagem: "Corpo invalido." });
  }
  return {
    slug: Slug.de(estabelecimento),
    email: Email.de(email),
    senha: SenhaEmTexto.deTentativa(senha),
  };
}
