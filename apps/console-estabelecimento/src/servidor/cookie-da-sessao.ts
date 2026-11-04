import { cookies } from "next/headers";
import { NOME_DO_COOKIE, opcoesDoCookie } from "../sessao/cookie-de-sessao";
import { SessaoDoConsole } from "../sessao/sessao-do-console";
import { RelogioDoSistema } from "./relogio-do-sistema";

/** Le a sessao do cookie HttpOnly (so em codigo de servidor). */
export async function lerSessao(): Promise<SessaoDoConsole | null> {
  const armazem = await cookies();
  return SessaoDoConsole.deCookie(armazem.get(NOME_DO_COOKIE)?.value);
}

export async function gravarSessao(sessao: SessaoDoConsole): Promise<void> {
  const armazem = await cookies();
  armazem.set(NOME_DO_COOKIE, sessao.paraCookie(), opcoesDoCookie(sessao, new RelogioDoSistema()));
}

export async function apagarSessao(): Promise<void> {
  const armazem = await cookies();
  armazem.delete(NOME_DO_COOKIE);
}
