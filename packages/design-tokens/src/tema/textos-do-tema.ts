import { esquemaDeTextos, type DadosDeTextos } from "../esquema/esquema-do-tema";
import { validarComEsquema } from "../esquema/validar-com-esquema";

/** Frase de boas-vindas e mensagem de confirmacao do estabelecimento. Imutavel. */
export class TextosDoTema {
  private constructor(
    readonly boasVindas: string,
    readonly confirmacao: string,
  ) {}

  static criar(entrada: unknown): TextosDoTema {
    const dados = validarComEsquema(esquemaDeTextos, entrada);
    return new TextosDoTema(dados.boasVindas, dados.confirmacao);
  }

  comBoasVindas(boasVindas: string): TextosDoTema {
    return TextosDoTema.criar({ ...this.paraDados(), boasVindas });
  }

  comConfirmacao(confirmacao: string): TextosDoTema {
    return TextosDoTema.criar({ ...this.paraDados(), confirmacao });
  }

  paraDados(): DadosDeTextos {
    return { boasVindas: this.boasVindas, confirmacao: this.confirmacao };
  }
}
