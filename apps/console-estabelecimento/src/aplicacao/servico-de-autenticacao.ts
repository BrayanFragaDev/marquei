import type { ClienteDaApi } from "@marquei/api-client";
import { FalhaDaApi } from "../api/falha-da-api";
import { SessaoDoConsole } from "../sessao/sessao-do-console";

export interface CredenciaisDeLogin {
  readonly estabelecimento: string;
  readonly email: string;
  readonly senha: string;
}

export type MotivoDeFalhaNoLogin = "credenciais_invalidas" | "conta_bloqueada" | "dados_invalidos";

export type ResultadoDoLogin =
  | { readonly ok: true; readonly sessao: SessaoDoConsole }
  | { readonly ok: false; readonly motivo: MotivoDeFalhaNoLogin };

const MOTIVO_POR_STATUS: Readonly<Record<number, MotivoDeFalhaNoLogin>> = {
  400: "dados_invalidos",
  401: "credenciais_invalidas",
  429: "conta_bloqueada",
};

/** Login do console: devolve a sessao ou o motivo da falha (sem vazar qual campo errou). */
export class ServicoDeAutenticacao {
  constructor(private readonly api: ClienteDaApi) {}

  async entrar(credenciais: CredenciaisDeLogin): Promise<ResultadoDoLogin> {
    const { data, error, response } = await this.api.POST("/v1/auth/login", {
      body: credenciais,
    });
    if (data) return { ok: true, sessao: SessaoDoConsole.criar(data) };
    const motivo = MOTIVO_POR_STATUS[response.status];
    if (motivo) return { ok: false, motivo };
    throw FalhaDaApi.deResposta(response.status, error);
  }
}
