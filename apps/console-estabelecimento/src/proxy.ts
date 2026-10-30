import { Instante } from "@marquei/dominio";
import type { Relogio } from "@marquei/dominio";
import { NextResponse, type NextRequest } from "next/server";
import { ProtecaoDeRotas } from "./sessao/protecao-de-rotas";
import { NOME_DO_COOKIE } from "./sessao/cookie-de-sessao";
import { SessaoDoConsole } from "./sessao/sessao-do-console";

const relogioDoSistema: Relogio = { agora: () => Instante.deEpochMs(Date.now()) };

/** Protege as rotas autenticadas (convencao `proxy` do Next 16, antigo middleware). */
export function proxy(requisicao: NextRequest): NextResponse {
  const sessao = SessaoDoConsole.deCookie(requisicao.cookies.get(NOME_DO_COOKIE)?.value);
  const decisao = new ProtecaoDeRotas(relogioDoSistema).decidir(
    requisicao.nextUrl.pathname,
    sessao,
  );
  if (decisao.acao === "seguir") return NextResponse.next();
  return NextResponse.redirect(new URL(decisao.destino, requisicao.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
