/* eslint-disable */
// ARQUIVO GERADO por `pnpm gerar:api-client` a partir de apps/api/openapi/openapi.yaml.
// NAO EDITE A MAO: altere o OpenAPI e regere.

export interface paths {
  "/v1/auth/login": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Login de dono, gestor ou profissional por e-mail e senha
     * @description Rota publica (com rate limit e bloqueio por tentativas). O estabelecimento e informado pelo
     *     SLUG publico; o tenant (id) do token e resolvido no servidor. Credenciais invalidas,
     *     e-mail inexistente e slug inexistente respondem exatamente igual (`credenciais_invalidas`).
     */
    post: operations["entrar"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/estabelecimentos/{slug}": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Dados publicos do estabelecimento e tema publicado
     * @description Rota publica (com rate limit). Nunca devolve tema em rascunho; `tema` e nulo enquanto nenhum
     *     tema foi publicado. Estabelecimento suspenso ou encerrado responde 404, igual a inexistente.
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
     * @description O cliente final e o estabelecimento vem do token; so o papel `cliente_final` agenda
     *     (`acao_nao_permitida` para os demais). O horario precisa estar entre os livres do dia.
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
    /**
     * Cancela um agendamento dentro da politica de cancelamento
     * @description O cliente so cancela os proprios agendamentos; o de outro cliente (ou de outro
     *     estabelecimento) responde 404.
     */
    post: operations["cancelarAgendamento"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/tema": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Tema publicado do estabelecimento da sessao
     * @description Qualquer sessao do estabelecimento (inclusive cliente final) le o tema publicado. Nunca
     *     devolve rascunho. Enquanto nada foi publicado, devolve o padrao da vertical
     *     (`origem: padrao`, `versao: 0`).
     */
    get: operations["obterTemaPublicado"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/tema/opcoes": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Opcoes curadas disponiveis para montar um tema
     * @description Familias tipograficas, raios, densidades, presets, campos de cor e contraste minimo.
     */
    get: operations["listarOpcoesDeTema"];
    put?: never;
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/tema/rascunho": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    /**
     * Ponto de partida do editor (dono ou gestor)
     * @description Devolve o rascunho salvo (`origem: rascunho`); sem rascunho, o publicado
     *     (`origem: publicado`); sem ambos, o padrao da vertical (`origem: padrao`, `versao: 0`).
     */
    get: operations["obterRascunhoDoTema"];
    /**
     * Salva o rascunho do tema (dono ou gestor)
     * @description Aceita contraste abaixo de AA: so a publicacao exige. Nao altera o tema publicado.
     *     Emite `tema_rascunho_salvo`.
     */
    put: operations["salvarRascunhoDoTema"];
    post?: never;
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/tema/rascunho/restaurar-padrao": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Substitui o rascunho pelo tema padrao da vertical (dono ou gestor)
     * @description Nao altera o tema publicado. Emite `tema_rascunho_salvo`.
     */
    post: operations["restaurarTemaPadraoDaVertical"];
    delete?: never;
    options?: never;
    head?: never;
    patch?: never;
    trace?: never;
  };
  "/v1/tema/publicar": {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    get?: never;
    put?: never;
    /**
     * Publica o rascunho (dono ou gestor)
     * @description Exige contraste WCAG AA. Se reprovar, responde 422 com a cor sugerida por campo e o tema
     *     publicado permanece como estava. Emite `tema_publicado`.
     */
    post: operations["publicarTema"];
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
    /** @example #2457c5 */
    CorHex: string;
    TermoDoVocabulario: {
      singular: string;
      plural: string;
    };
    /** @description Tokens do tema (esquema de `packages/design-tokens`). So opcoes curadas. */
    TemaTokens: {
      cores: {
        primaria: components["schemas"]["CorHex"];
        textoSobrePrimaria: components["schemas"]["CorHex"];
        apoio: components["schemas"]["CorHex"];
        fundo: components["schemas"]["CorHex"];
        superficie: components["schemas"]["CorHex"];
        texto: components["schemas"]["CorHex"];
        textoSuave: components["schemas"]["CorHex"];
      };
      /** @enum {string} */
      familia: "inter" | "poppins" | "montserrat" | "playfair-display" | "roboto-slab";
      /** @enum {string} */
      raio: "reto" | "suave" | "arredondado";
      /** @enum {string} */
      densidade: "compacta" | "confortavel";
      /** @enum {string} */
      cabecalho: "simples" | "centralizado" | "capa";
      /** @enum {string} */
      cartaoDeServico: "lista" | "destaque" | "grade";
      textos: {
        boasVindas: string;
        confirmacao: string;
      };
      vocabulario: {
        profissional: components["schemas"]["TermoDoVocabulario"];
        servico: components["schemas"]["TermoDoVocabulario"];
        agendamento: components["schemas"]["TermoDoVocabulario"];
      };
    };
    RespostaDeTema: {
      /** @description Versao do estado devolvido. 0 = padrao da vertical, nunca salvo. */
      versao: number;
      atualizadoEm: components["schemas"]["Instante"] | null;
      /** @enum {string} */
      origem: "rascunho" | "publicado" | "padrao";
      tokens: components["schemas"]["TemaTokens"];
    };
    OpcoesDeTema: {
      familias: {
        id: string;
        nome: string;
        pilhaCss: string;
      }[];
      raios: {
        id: string;
        escala: {
          campo: number;
          botao: number;
          cartao: number;
        };
      }[];
      densidades: {
        id: string;
        espacamento: {
          xs: number;
          sm: number;
          md: number;
          lg: number;
          xl: number;
          alturaDoCampo: number;
        };
      }[];
      cabecalhos: string[];
      cartoesDeServico: string[];
      camposDeCor: string[];
      verticais: string[];
      contrasteMinimo: {
        /** @example 4.5 */
        textoNormal: number;
        /** @example 3 */
        componente: number;
      };
    };
    ErroDeTema: {
      /**
       * @example contraste_insuficiente
       * @example tema_invalido
       * @example sem_permissao_para_alterar_tema
       */
      codigo: string;
      mensagem: string;
      /** @description Por campo. Em `contraste_insuficiente`, `sugestao` traz a cor que passa em AA para o `campo` ajustavel; em `tema_invalido`, `campo` e o caminho pontuado do problema. */
      detalhes?: {
        campo: string;
        codigo: string;
        mensagem?: string;
        sugestao?: components["schemas"]["CorHex"];
      }[];
    };
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
    ErroDeBloqueio: {
      codigo: string;
      mensagem: string;
      bloqueadoAte: components["schemas"]["Instante"];
    };
    LoginEntrada: {
      /** @description Slug publico do estabelecimento. */
      estabelecimento: string;
      /** Format: email */
      email: string;
      /** Format: password */
      senha: string;
    };
    LoginResposta: {
      /** @description JWT para o cabecalho `Authorization: Bearer`. */
      token: string;
      expiraEm: components["schemas"]["Instante"];
      /** Format: uuid */
      usuarioId: string;
      /** @enum {string} */
      papel: "profissional" | "gestor" | "dono";
      /** Format: uuid */
      estabelecimentoId: string;
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
      /** @description Slug da vertical, como barbearia ou manicure. */
      vertical: string;
      /**
       * @description Termos do segmento (profissional, servico, cliente, estabelecimento).
       * @example {
       *       "profissional": "barbeiro",
       *       "servico": "servico",
       *       "cliente": "cliente",
       *       "estabelecimento": "barbearia"
       *     }
       */
      vocabulario: {
        [key: string]: string;
      };
      /**
       * @description Fuso IANA.
       * @example America/Sao_Paulo
       */
      fusoHorario: string;
      /** @description Tema publicado; nulo enquanto nenhum foi publicado. */
      tema: components["schemas"]["TemaPublicado"] | null;
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
    /** @description Somente dono ou gestor alteram ou leem o rascunho (`sem_permissao_para_alterar_tema`); tenant divergente do token tambem responde 403 (`tenant_divergente`). */
    SemPermissaoParaTema: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        "application/json": components["schemas"]["ErroDeTema"];
      };
    };
    /** @description Entrada invalida (`requisicao_invalida`, `identificador_invalido`). */
    RequisicaoInvalida: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        "application/json": components["schemas"]["Erro"];
      };
    };
    /** @description Sem permissao: papel sem acesso a acao (`acao_nao_permitida`) ou tenant informado pelo cliente que diverge do token (`tenant_divergente`). */
    Proibido: {
      headers: {
        [name: string]: unknown;
      };
      content: {
        "application/json": components["schemas"]["Erro"];
      };
    };
    /** @description Token ausente, expirado ou invalido (`sessao_invalida` ou `sessao_expirada`). */
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
  entrar: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["LoginEntrada"];
      };
    };
    responses: {
      /** @description Sessao emitida. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["LoginResposta"];
        };
      };
      400: components["responses"]["RequisicaoInvalida"];
      /** @description Credenciais invalidas (`credenciais_invalidas`). */
      401: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Erro"];
        };
      };
      /** @description Conta bloqueada por tentativas (`conta_bloqueada_por_tentativas`). */
      429: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ErroDeBloqueio"];
        };
      };
    };
  };
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
      400: components["responses"]["RequisicaoInvalida"];
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
      /** @description Profissional nao realiza o servico (`profissional_nao_executa_servico`). */
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
      403: components["responses"]["Proibido"];
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
      400: components["responses"]["RequisicaoInvalida"];
      401: components["responses"]["NaoAutenticado"];
      403: components["responses"]["Proibido"];
      404: components["responses"]["NaoEncontrado"];
      /** @description Nao cancelavel (`agendamento_nao_cancelavel`) ou fora do prazo (`fora_do_prazo_de_cancelamento`). O prazo vale so para o cliente; dono, gestor e profissional cancelam a qualquer momento. */
      409: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["Erro"];
        };
      };
    };
  };
  obterTemaPublicado: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Tema publicado ou padrao da vertical. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["RespostaDeTema"];
        };
      };
      401: components["responses"]["NaoAutenticado"];
    };
  };
  listarOpcoesDeTema: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Opcoes curadas. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["OpcoesDeTema"];
        };
      };
      401: components["responses"]["NaoAutenticado"];
    };
  };
  obterRascunhoDoTema: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Tema para edicao. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["RespostaDeTema"];
        };
      };
      401: components["responses"]["NaoAutenticado"];
      403: components["responses"]["SemPermissaoParaTema"];
    };
  };
  salvarRascunhoDoTema: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody: {
      content: {
        "application/json": components["schemas"]["TemaTokens"];
      };
    };
    responses: {
      /** @description Rascunho salvo. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["RespostaDeTema"];
        };
      };
      /** @description Tema fora do esquema ou das opcoes curadas (`tema_invalido`). */
      400: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ErroDeTema"];
        };
      };
      401: components["responses"]["NaoAutenticado"];
      403: components["responses"]["SemPermissaoParaTema"];
    };
  };
  restaurarTemaPadraoDaVertical: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Rascunho restaurado. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["RespostaDeTema"];
        };
      };
      401: components["responses"]["NaoAutenticado"];
      403: components["responses"]["SemPermissaoParaTema"];
    };
  };
  publicarTema: {
    parameters: {
      query?: never;
      header?: never;
      path?: never;
      cookie?: never;
    };
    requestBody?: never;
    responses: {
      /** @description Tema publicado. */
      200: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["RespostaDeTema"];
        };
      };
      401: components["responses"]["NaoAutenticado"];
      403: components["responses"]["SemPermissaoParaTema"];
      /** @description Nao ha rascunho salvo (`rascunho_de_tema_nao_encontrado`). */
      404: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ErroDeTema"];
        };
      };
      /** @description Contraste abaixo de AA (`contraste_insuficiente`), com sugestoes em `detalhes`. */
      422: {
        headers: {
          [name: string]: unknown;
        };
        content: {
          "application/json": components["schemas"]["ErroDeTema"];
        };
      };
    };
  };
}
