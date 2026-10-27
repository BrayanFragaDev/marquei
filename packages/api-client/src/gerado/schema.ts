/* eslint-disable */
// ARQUIVO GERADO por `pnpm gerar:api-client` a partir de apps/api/openapi/openapi.yaml.
// NAO EDITE A MAO: altere o OpenAPI e regere.

export interface paths {
  "/v1/estabelecimentos/{slug}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Dados publicos do estabelecimento e tema publicado
     * @description Rota publica (com rate limit). Nunca devolve tema em rascunho.
     */
    get: operations["obterEstabelecimentoPorSlug"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/servicos": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /** Lista os servicos ativos do estabelecimento da sessao */
    get: operations["listarServicos"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/horarios-livres": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Horarios livres para um servico em um dia
     * @description Respeita duracao do servico, intervalo entre atendimentos, folgas, bloqueios e
     *     agendamentos existentes. Sem `profissionalId`, agrega todos os profissionais
     *     que executam o servico.
     */
    get: operations["listarHorariosLivres"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/agendamentos": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Cria um agendamento para o cliente autenticado
     * @description O cliente final e o estabelecimento vem do token.
     */
    post: operations["criarAgendamento"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/agendamentos/{id}/cancelar": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /** Cancela um agendamento dentro da politica de cancelamento */
    post: operations["cancelarAgendamento"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
}
export type webhooks = Record<string, never>;
export interface components {
  schemas: {
    Erro: {
      /**
       * @description Codigo estavel em snake_case. Use-o, nunca a mensagem, para decidir o comportamento.
       * @example horario_indisponivel
       * @example fora_do_prazo_de_cancelamento
       */
      codigo: string;
      /** @description Texto para depuracao; nao e contrato. */
      mensagem: string;
      /** @description Problemas por campo, quando a entrada e invalida. */
      detalhes?: {
        campo: string;
        codigo: string;
      }[];
    };
    /**
     * Format: date-time
     * @description ISO 8601 em UTC.
     * @example 2026-10-27T15:00:00.000Z
     */
    Instante: string;
    /** @description Valor em centavos de real. */
    Centavos: number;
    EstabelecimentoPublico: {
      /** Format: uuid */
      id: string;
      slug: string;
      nome: string;
      vertical: string;
      /**
       * @description Fuso IANA.
       * @example America/Sao_Paulo
       */
      fusoHorario: string;
      tema: components["schemas"]["TemaPublicado"];
    };
    /** @description Envelope provisorio do tema publicado. O esquema detalhado dos tokens pertence a `packages/design-tokens` (DS) e sera referenciado aqui quando acordado. */
    TemaPublicado: {
      versao: number;
      tokens: {
        [key: string]: unknown;
      };
    };
    Servico: {
      /** Format: uuid */
      id: string;
      nome: string;
      duracaoMinutos: number;
      precoCentavos: components["schemas"]["Centavos"];
    };
    HorariosLivres: {
      /** Format: date */
      data: string;
      fusoHorario: string;
      itens: components["schemas"]["HorarioLivre"][];
    };
    HorarioLivre: {
      /** Format: uuid */
      profissionalId: string;
      inicio: components["schemas"]["Instante"];
      fim: components["schemas"]["Instante"];
    };
    NovoAgendamento: {
      /** Format: uuid */
      servicoId: string;
      /** Format: uuid */
      profissionalId: string;
      inicio: components["schemas"]["Instante"];
    };
    /** @enum {string} */
    StatusAgendamento: "confirmado" | "cancelado" | "concluido";
    Agendamento: {
      /** Format: uuid */
      id: string;
      /** Format: uuid */
      servicoId: string;
      /** Format: uuid */
      profissionalId: string;
      inicio: components["schemas"]["Instante"];
      fim: components["schemas"]["Instante"];
      status: components["schemas"]["StatusAgendamento"];
      precoCentavos: components["schemas"]["Centavos"];
    };
  };
  responses: {
    /** @description Entrada invalida (`requisicao_invalida`, `identificador_invalido`). */
    RequisicaoInvalida: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        "application/json": components["schemas"]["Erro"];
      };
    };
    /** @description Token ausente, expirado ou invalido (`nao_autenticado`). */
    NaoAutenticado: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        "application/json": components["schemas"]["Erro"];
      };
    };
    /** @description Recurso inexistente ou de outro estabelecimento; ambos respondem igual (`nao_encontrado`, `agendamento_nao_encontrado`). */
    NaoEncontrado: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        "application/json": components["schemas"]["Erro"];
      };
    };
    /** @description Rate limit excedido (`muitas_requisicoes`). */
    MuitasRequisicoes: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        "application/json": components["schemas"]["Erro"];
      };
    };
  };
  parameters: never;
  requestBodies: never;
  headers: never;
  pathItems: never;
}
export type $defs = Record<string, never>;
export interface operations {
  obterEstabelecimentoPorSlug: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        slug: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Estabelecimento encontrado. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["EstabelecimentoPublico"];
        };
      };
      404: components["responses"]["NaoEncontrado"];
      429: components["responses"]["MuitasRequisicoes"];
    };
  };
  listarServicos: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Servicos ativos. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": {
            itens: components["schemas"]["Servico"][];
          };
        };
      };
      401: components["responses"]["NaoAutenticado"];
    };
  };
  listarHorariosLivres: {
    parameters: {
      query: {
        servicoId: string;
        profissionalId?: string;
        /** @description Dia civil no fuso do estabelecimento. */
        data: string;
      };
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Horarios livres do dia. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["HorariosLivres"];
        };
      };
      400: components["responses"]["RequisicaoInvalida"];
      401: components["responses"]["NaoAutenticado"];
      404: components["responses"]["NaoEncontrado"];
    };
  };
  criarAgendamento: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["NovoAgendamento"];
      };
    };
    responses: {
      /** @description Agendamento confirmado. */
      201: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Agendamento"];
        };
      };
      400: components["responses"]["RequisicaoInvalida"];
      401: components["responses"]["NaoAutenticado"];
      404: components["responses"]["NaoEncontrado"];
      /** @description Horario ja ocupado (`horario_indisponivel`). */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Erro"];
        };
      };
      /** @description Regra de negocio violada (ex.: `agendamento_no_passado`). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Erro"];
        };
      };
      429: components["responses"]["MuitasRequisicoes"];
    };
  };
  cancelarAgendamento: {
    parameters: {
      query?: never;
      header?: never;
      path: {
        id: string;
      };
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Agendamento cancelado. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Agendamento"];
        };
      };
      401: components["responses"]["NaoAutenticado"];
      404: components["responses"]["NaoEncontrado"];
      /** @description Nao cancelavel (`agendamento_nao_cancelavel`) ou fora do prazo (`fora_do_prazo_de_cancelamento`). */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Erro"];
        };
      };
    };
  };
}
