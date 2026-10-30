import type { Relogio } from "@marquei/dominio";
import type { SessaoDoConsole } from "./sessao-do-console";

/** Prefixo `__Host-`: so Secure, sem Domain, Path=/ (o navegador recusa se violar). */
export const NOME_DO_COOKIE = "__Host-ce_sessao";

export interface OpcoesDoCookie {
  readonly httpOnly: true;
  readonly secure: true;
  readonly sameSite: "lax";
  readonly path: "/";
  readonly maxAge: number;
}

/** Cookie de sessao: inacessivel ao JavaScript, so por HTTPS (ou localhost) e vida = a do token. */
export function opcoesDoCookie(sessao: SessaoDoConsole, relogio: Relogio): OpcoesDoCookie {
  return {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: sessao.segundosRestantes(relogio),
  };
}
