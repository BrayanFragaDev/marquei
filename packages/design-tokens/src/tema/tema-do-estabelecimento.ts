import type { CorHex } from "../cor/cor-hex";
import type { ValidadorDeContraste } from "../contraste/validador-de-contraste";
import { esquemaDoTema, type DadosDoTema } from "../esquema/esquema-do-tema";
import { validarComEsquema } from "../esquema/validar-com-esquema";
import {
  ESCALAS_DE_ESPACAMENTO,
  type EscalaDeEspacamento,
  type IdDeDensidade,
} from "../opcoes/densidades";
import { FamiliaTipografica } from "../opcoes/familias-tipograficas";
import type { IdDeCabecalho, IdDeCartaoDeServico } from "../opcoes/presets";
import { ESCALAS_DE_RAIO, type EscalaDeRaio, type IdDeRaio } from "../opcoes/raios";
import { PaletaDeCores } from "./paleta-de-cores";
import { TextosDoTema } from "./textos-do-tema";
import { Vocabulario } from "./vocabulario";

interface Partes {
  readonly cores: PaletaDeCores;
  readonly familia: FamiliaTipografica;
  readonly raio: IdDeRaio;
  readonly densidade: IdDeDensidade;
  readonly cabecalho: IdDeCabecalho;
  readonly cartaoDeServico: IdDeCartaoDeServico;
  readonly textos: TextosDoTema;
  readonly vocabulario: Vocabulario;
}

/**
 * Tema visual de um estabelecimento (rascunho ou publicado: o estado vive fora deste objeto).
 * Imutavel; um tema invalido nao pode existir. Contraste NAO e invariante: rascunho pode ter
 * contraste ruim e so `validarParaPublicacao` recusa.
 */
export class TemaDoEstabelecimento {
  private constructor(private readonly partes: Partes) {}

  /** Cria a partir de entrada nao confiavel (formulario, API). Falha com `TemaInvalidoError`. */
  static criar(entrada: unknown): TemaDoEstabelecimento {
    const d = validarComEsquema(esquemaDoTema, entrada);
    return new TemaDoEstabelecimento({
      cores: PaletaDeCores.criar(d.cores),
      familia: FamiliaTipografica.de(d.familia),
      raio: d.raio,
      densidade: d.densidade,
      cabecalho: d.cabecalho,
      cartaoDeServico: d.cartaoDeServico,
      textos: TextosDoTema.criar(d.textos),
      vocabulario: Vocabulario.criar(d.vocabulario),
    });
  }

  /** Recria a partir do que `paraDados()` produziu (ex.: JSON do banco). Mesmas invariantes. */
  static reconstituir(dados: DadosDoTema): TemaDoEstabelecimento {
    return TemaDoEstabelecimento.criar(dados);
  }

  get cores(): PaletaDeCores {
    return this.partes.cores;
  }
  get familia(): FamiliaTipografica {
    return this.partes.familia;
  }
  get raio(): IdDeRaio {
    return this.partes.raio;
  }
  get densidade(): IdDeDensidade {
    return this.partes.densidade;
  }
  get cabecalho(): IdDeCabecalho {
    return this.partes.cabecalho;
  }
  get cartaoDeServico(): IdDeCartaoDeServico {
    return this.partes.cartaoDeServico;
  }
  get textos(): TextosDoTema {
    return this.partes.textos;
  }
  get vocabulario(): Vocabulario {
    return this.partes.vocabulario;
  }

  escalaDeRaio(): EscalaDeRaio {
    return ESCALAS_DE_RAIO[this.partes.raio];
  }

  escalaDeEspacamento(): EscalaDeEspacamento {
    return ESCALAS_DE_ESPACAMENTO[this.partes.densidade];
  }

  comCores(cores: PaletaDeCores): TemaDoEstabelecimento {
    return this.com({ cores });
  }

  comCorPrimaria(cor: CorHex): TemaDoEstabelecimento {
    return this.com({ cores: this.partes.cores.comCor("primaria", cor) });
  }

  comFamilia(familia: FamiliaTipografica): TemaDoEstabelecimento {
    return this.com({ familia });
  }

  comRaio(raio: IdDeRaio): TemaDoEstabelecimento {
    return this.com({ raio });
  }

  comDensidade(densidade: IdDeDensidade): TemaDoEstabelecimento {
    return this.com({ densidade });
  }

  comCabecalho(cabecalho: IdDeCabecalho): TemaDoEstabelecimento {
    return this.com({ cabecalho });
  }

  comCartaoDeServico(cartaoDeServico: IdDeCartaoDeServico): TemaDoEstabelecimento {
    return this.com({ cartaoDeServico });
  }

  comTextos(textos: TextosDoTema): TemaDoEstabelecimento {
    return this.com({ textos });
  }

  comVocabulario(vocabulario: Vocabulario): TemaDoEstabelecimento {
    return this.com({ vocabulario });
  }

  /** Falha com `ContrasteInsuficienteError` (com sugestoes) se algum par reprova em WCAG AA. */
  validarParaPublicacao(validador: ValidadorDeContraste): void {
    validador.exigirPublicavel(this);
  }

  paraDados(): DadosDoTema {
    return {
      cores: this.partes.cores.paraDados(),
      familia: this.partes.familia.id,
      raio: this.partes.raio,
      densidade: this.partes.densidade,
      cabecalho: this.partes.cabecalho,
      cartaoDeServico: this.partes.cartaoDeServico,
      textos: this.partes.textos.paraDados(),
      vocabulario: this.partes.vocabulario.paraDados(),
    };
  }

  private com(alteracao: Partial<Partes>): TemaDoEstabelecimento {
    return new TemaDoEstabelecimento({ ...this.partes, ...alteracao });
  }
}
