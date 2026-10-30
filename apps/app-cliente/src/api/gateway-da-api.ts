import type { ClienteDaApi, components } from "@marquei/api-client";
import { CODIGO_REDE_INDISPONIVEL, ErroDaApi } from "./erro-da-api";

type Esquemas = components["schemas"];
export type Servico = Esquemas["Servico"];
export type Agendamento = Esquemas["Agendamento"];
export type HorariosLivres = Esquemas["HorariosLivres"];
export type SessaoDaApi = Esquemas["LoginResposta"];

interface Resultado<T> {
  readonly data?: T | undefined;
  readonly error?: unknown;
  readonly response: Response;
}

function codigoDoCorpo(corpo: unknown): string {
  if (typeof corpo === "object" && corpo !== null && "codigo" in corpo) {
    const { codigo } = corpo;
    if (typeof codigo === "string") return codigo;
  }
  return "erro_desconhecido";
}

async function desembrulhar<T>(chamada: Promise<Resultado<T>>): Promise<T> {
  let resultado: Resultado<T>;
  try {
    resultado = await chamada;
  } catch {
    throw new ErroDaApi(CODIGO_REDE_INDISPONIVEL, 0);
  }
  if (resultado.data === undefined) {
    throw new ErroDaApi(codigoDoCorpo(resultado.error), resultado.response.status);
  }
  return resultado.data;
}

/** Traduz o cliente tipado em chamadas por intenção, devolvendo dados ou lançando `ErroDaApi`. */
export class GatewayDaApi {
  constructor(private readonly api: ClienteDaApi) {}

  async listarServicos(): Promise<readonly Servico[]> {
    const { itens } = await desembrulhar(this.api.GET("/v1/servicos"));
    return itens;
  }

  listarHorariosLivres(consulta: {
    servicoId: string;
    profissionalId: string | null;
    data: string;
  }): Promise<HorariosLivres> {
    const { servicoId, profissionalId, data } = consulta;
    const query = { servicoId, data, ...(profissionalId ? { profissionalId } : {}) };
    return desembrulhar(this.api.GET("/v1/horarios-livres", { params: { query } }));
  }

  criarAgendamento(entrada: {
    servicoId: string;
    profissionalId: string;
    inicio: string;
  }): Promise<Agendamento> {
    return desembrulhar(this.api.POST("/v1/agendamentos", { body: entrada }));
  }

  cancelarAgendamento(id: string): Promise<Agendamento> {
    return desembrulhar(
      this.api.POST("/v1/agendamentos/{id}/cancelar", { params: { path: { id } } }),
    );
  }

  entrar(entrada: { estabelecimento: string; email: string; senha: string }): Promise<SessaoDaApi> {
    return desembrulhar(this.api.POST("/v1/auth/login", { body: entrada }));
  }
}
