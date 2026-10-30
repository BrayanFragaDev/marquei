import type { ClienteDaApi, components } from "@marquei/api-client";
import { TemaDoEstabelecimento, type DadosDoTema } from "@marquei/design-tokens";
import { FalhaDaApi, desembrulhar, type DetalheDaFalha } from "../api/falha-da-api";

type Esquemas = components["schemas"];
export type OpcoesDeTema = Esquemas["OpcoesDeTema"];
export type OrigemDoTema = Esquemas["RespostaDeTema"]["origem"];

export interface TemaCarregado {
  readonly tema: DadosDoTema;
  readonly origem: OrigemDoTema;
  readonly versao: number;
}

export interface TemaParaEdicao extends TemaCarregado {
  readonly opcoes: OpcoesDeTema;
}

export type MotivoDeRecusaDoTema =
  | "tema_invalido"
  | "sem_permissao"
  | "sem_rascunho"
  | "contraste_insuficiente"
  | "sessao_expirada";

export type ResultadoDaAcaoDeTema =
  | ({ readonly ok: true } & TemaCarregado)
  | {
      readonly ok: false;
      readonly motivo: MotivoDeRecusaDoTema;
      readonly detalhes: readonly DetalheDaFalha[];
    };

const MOTIVO_POR_STATUS: Readonly<Record<number, MotivoDeRecusaDoTema>> = {
  400: "tema_invalido",
  401: "sessao_expirada",
  403: "sem_permissao",
  404: "sem_rascunho",
  422: "contraste_insuficiente",
};

/** Casos de uso de tema do console. A validacao de verdade e da API e do design-tokens. */
export class ServicoDeTema {
  constructor(private readonly api: ClienteDaApi) {}

  async carregarPublicado(): Promise<TemaCarregado> {
    return paraCarregado(desembrulhar(await this.api.GET("/v1/tema")));
  }

  async carregarParaEdicao(): Promise<TemaParaEdicao> {
    const [opcoes, rascunho] = await Promise.all([
      this.api.GET("/v1/tema/opcoes"),
      this.api.GET("/v1/tema/rascunho"),
    ]);
    return { opcoes: desembrulhar(opcoes), ...paraCarregado(desembrulhar(rascunho)) };
  }

  salvarRascunho(tema: DadosDoTema): Promise<ResultadoDaAcaoDeTema> {
    return this.tratar(this.api.PUT("/v1/tema/rascunho", { body: tema }));
  }

  restaurarPadrao(): Promise<ResultadoDaAcaoDeTema> {
    return this.tratar(this.api.POST("/v1/tema/rascunho/restaurar-padrao"));
  }

  publicar(): Promise<ResultadoDaAcaoDeTema> {
    return this.tratar(this.api.POST("/v1/tema/publicar"));
  }

  private async tratar(chamada: Promise<RespostaDeTema>): Promise<ResultadoDaAcaoDeTema> {
    const { data, error, response } = await chamada;
    if (data) return { ok: true, ...paraCarregado(data) };
    const falha = FalhaDaApi.deResposta(response.status, error);
    const motivo = MOTIVO_POR_STATUS[response.status];
    if (!motivo) throw falha;
    return { ok: false, motivo, detalhes: falha.detalhes };
  }
}

interface RespostaDeTema {
  readonly data?: Esquemas["RespostaDeTema"] | undefined;
  readonly error?: unknown;
  readonly response: Response;
}

function paraCarregado(resposta: Esquemas["RespostaDeTema"]): TemaCarregado {
  return {
    tema: TemaDoEstabelecimento.criar(resposta.tokens).paraDados(),
    origem: resposta.origem,
    versao: resposta.versao,
  };
}
