import { CorHex } from "../cor/cor-hex";
import { esquemaDeCores, type CampoDeCor, type DadosDeCores } from "../esquema/esquema-do-tema";
import { validarComEsquema } from "../esquema/validar-com-esquema";

type CoresPorCampo = Readonly<Record<CampoDeCor, CorHex>>;

/** Conjunto de cores do tema. Imutavel: `comCor` devolve nova paleta. */
export class PaletaDeCores {
  private constructor(private readonly porCampo: CoresPorCampo) {}

  static criar(entrada: unknown): PaletaDeCores {
    const dados = validarComEsquema(esquemaDeCores, entrada);
    return new PaletaDeCores({
      primaria: CorHex.criar(dados.primaria),
      textoSobrePrimaria: CorHex.criar(dados.textoSobrePrimaria),
      apoio: CorHex.criar(dados.apoio),
      fundo: CorHex.criar(dados.fundo),
      superficie: CorHex.criar(dados.superficie),
      texto: CorHex.criar(dados.texto),
      textoSuave: CorHex.criar(dados.textoSuave),
    });
  }

  obter(campo: CampoDeCor): CorHex {
    return this.porCampo[campo];
  }

  comCor(campo: CampoDeCor, cor: CorHex): PaletaDeCores {
    return new PaletaDeCores({ ...this.porCampo, [campo]: cor });
  }

  paraDados(): DadosDeCores {
    const { primaria, textoSobrePrimaria, apoio, fundo, superficie, texto, textoSuave } =
      this.porCampo;
    return {
      primaria: primaria.valor,
      textoSobrePrimaria: textoSobrePrimaria.valor,
      apoio: apoio.valor,
      fundo: fundo.valor,
      superficie: superficie.valor,
      texto: texto.valor,
      textoSuave: textoSuave.valor,
    };
  }
}
