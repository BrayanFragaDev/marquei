import type { Relogio } from "@marquei/dominio";
import { PermissoesDoPapel } from "./permissoes-do-papel";
import type { SessaoDoConsole } from "./sessao-do-console";

export const ROTA_DE_LOGIN = "/login";

export type DecisaoDeRota =
  | { readonly acao: "seguir" }
  | { readonly acao: "redirecionar"; readonly destino: string };

const SEGUIR: DecisaoDeRota = { acao: "seguir" };
const paraOnde = (destino: string): DecisaoDeRota => ({ acao: "redirecionar", destino });

/** Decide se uma requisicao pode seguir; usada pelo `proxy.ts` (antigo middleware). */
export class ProtecaoDeRotas {
  constructor(private readonly relogio: Relogio) {}

  decidir(caminho: string, sessao: SessaoDoConsole | null): DecisaoDeRota {
    if (caminho === ROTA_DE_LOGIN) return SEGUIR;
    if (!sessao || sessao.expirada(this.relogio)) return paraOnde(ROTA_DE_LOGIN);
    const permissoes = new PermissoesDoPapel(sessao.papel);
    const secao = PermissoesDoPapel.secaoDoCaminho(caminho);
    if (secao !== null && !permissoes.podeVer(secao)) return paraOnde(permissoes.rotaInicial());
    return SEGUIR;
  }
}
