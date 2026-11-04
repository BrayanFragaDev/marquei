import {
  TemaDoEstabelecimento,
  TemaInvalidoError,
  ValidadorDeContraste,
  paraVariaveisCss,
  type CampoDeCor,
  type DadosDoTema,
  type IdDeCabecalho,
  type IdDeCartaoDeServico,
  type IdDeDensidade,
  type IdDeFamilia,
  type IdDeRaio,
  type DadosDoProblema,
} from "@marquei/design-tokens";

export interface AvaliacaoDoTema {
  /** Falso se o tema fugiu do esquema (nao pode ser salvo). */
  readonly valido: boolean;
  readonly problemasDeEsquema: readonly string[];
  readonly problemasDeContraste: readonly DadosDoProblema[];
  /** Salvar rascunho: basta ser valido. */
  readonly podeSalvar: boolean;
  /** Publicar: valido e em WCAG AA. */
  readonly podePublicar: boolean;
  /** Variaveis CSS da pre-visualizacao (vazio se o tema e invalido). */
  readonly variaveis: Readonly<Record<string, string>>;
}

/**
 * Estado imutavel do editor de tema: o rascunho em edicao e o ultimo estado salvo. Toda regra de
 * validacao e de contraste vem de `@marquei/design-tokens`; esta classe so a orquestra.
 */
export class EditorDeTema {
  private constructor(
    readonly rascunho: DadosDoTema,
    private readonly salvo: DadosDoTema,
    private readonly validador: ValidadorDeContraste,
  ) {}

  static iniciar(tema: DadosDoTema, validador = new ValidadorDeContraste()): EditorDeTema {
    return new EditorDeTema(tema, tema, validador);
  }

  comCor(campo: CampoDeCor, valor: string): EditorDeTema {
    return this.com({ ...this.rascunho, cores: { ...this.rascunho.cores, [campo]: valor } });
  }
  comFamilia(familia: IdDeFamilia): EditorDeTema {
    return this.com({ ...this.rascunho, familia });
  }
  comRaio(raio: IdDeRaio): EditorDeTema {
    return this.com({ ...this.rascunho, raio });
  }
  comDensidade(densidade: IdDeDensidade): EditorDeTema {
    return this.com({ ...this.rascunho, densidade });
  }
  comCabecalho(cabecalho: IdDeCabecalho): EditorDeTema {
    return this.com({ ...this.rascunho, cabecalho });
  }
  comCartaoDeServico(cartaoDeServico: IdDeCartaoDeServico): EditorDeTema {
    return this.com({ ...this.rascunho, cartaoDeServico });
  }
  comTexto(campo: "boasVindas" | "confirmacao", valor: string): EditorDeTema {
    return this.com({ ...this.rascunho, textos: { ...this.rascunho.textos, [campo]: valor } });
  }

  /** Aplica a sugestao de cor de um problema de contraste. */
  comSugestao(problema: DadosDoProblema): EditorDeTema {
    return this.comCor(problema.campoAjustado, problema.corSugerida);
  }

  /** Aplica todas as sugestoes (melhor esforco); sem efeito se o tema e invalido. */
  comContrasteCorrigido(): EditorDeTema {
    const tema = this.tentarCriar();
    if (!tema) return this;
    return this.com(this.validador.corrigir(tema).paraDados());
  }

  /** Estado apos salvar ou restaurar: o rascunho passa a ser o salvo. */
  comoSalvo(tema: DadosDoTema): EditorDeTema {
    return new EditorDeTema(tema, tema, this.validador);
  }

  /** Volta ao ultimo estado salvo. */
  descartado(): EditorDeTema {
    return this.com(this.salvo);
  }

  temAlteracoesNaoSalvas(): boolean {
    return JSON.stringify(this.rascunho) !== JSON.stringify(this.salvo);
  }

  avaliar(): AvaliacaoDoTema {
    const tema = this.tentarCriar();
    if (!tema) return avaliacaoInvalida(this.problemasDoEsquema());
    const contraste = this.validador.validar(tema).map((p) => p.paraDados());
    return {
      valido: true,
      problemasDeEsquema: [],
      problemasDeContraste: contraste,
      podeSalvar: true,
      podePublicar: contraste.length === 0,
      variaveis: paraVariaveisCss(tema).variaveis,
    };
  }

  private com(rascunho: DadosDoTema): EditorDeTema {
    return new EditorDeTema(rascunho, this.salvo, this.validador);
  }

  private tentarCriar(): TemaDoEstabelecimento | null {
    try {
      return TemaDoEstabelecimento.criar(this.rascunho);
    } catch (erro) {
      if (erro instanceof TemaInvalidoError) return null;
      throw erro;
    }
  }

  private problemasDoEsquema(): readonly string[] {
    try {
      TemaDoEstabelecimento.criar(this.rascunho);
      return [];
    } catch (erro) {
      if (erro instanceof TemaInvalidoError) return erro.problemas.map((p) => p.caminho);
      throw erro;
    }
  }
}

function avaliacaoInvalida(problemasDeEsquema: readonly string[]): AvaliacaoDoTema {
  return {
    valido: false,
    problemasDeEsquema,
    problemasDeContraste: [],
    podeSalvar: false,
    podePublicar: false,
    variaveis: {},
  };
}
