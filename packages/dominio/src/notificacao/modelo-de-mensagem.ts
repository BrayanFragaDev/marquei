import { ModeloDeMensagemInvalidoError } from "./modelo-de-mensagem-invalido-error";

const PADRAO_CHAVE = /^[a-z][a-z0-9_]{2,63}$/;
const PADRAO_NOME_DE_VARIAVEL = /^[a-z][a-z0-9_]{0,63}$/;
const TAMANHO_MAXIMO_DO_VALOR = 1000;

/**
 * Mensagem identificada por uma chave de template (ex.: `lembrete_agendamento_24h`) mais
 * variaveis. O texto final e responsabilidade do adaptador/catalogo de mensagens, nunca do
 * dominio. Imutavel.
 */
export class ModeloDeMensagem {
  private constructor(
    readonly chave: string,
    private readonly valores: Readonly<Record<string, string>>,
  ) {}

  static criar(chave: string, variaveis: Readonly<Record<string, string>> = {}): ModeloDeMensagem {
    if (!PADRAO_CHAVE.test(chave)) {
      throw new ModeloDeMensagemInvalidoError(
        "a chave deve estar em snake_case (3 a 64 caracteres)",
      );
    }
    const copia: Record<string, string> = {};
    for (const [nome, valor] of Object.entries(variaveis)) {
      ModeloDeMensagem.validarVariavel(nome, valor);
      copia[nome] = valor;
    }
    return new ModeloDeMensagem(chave, Object.freeze(copia));
  }

  private static validarVariavel(nome: string, valor: string): void {
    if (!PADRAO_NOME_DE_VARIAVEL.test(nome)) {
      throw new ModeloDeMensagemInvalidoError(`nome de variavel invalido (${nome})`);
    }
    if (valor.length > TAMANHO_MAXIMO_DO_VALOR) {
      throw new ModeloDeMensagemInvalidoError(`valor da variavel ${nome} longo demais`);
    }
  }

  /** Retorna novo modelo; substitui a variavel se ja existir. */
  comVariavel(nome: string, valor: string): ModeloDeMensagem {
    return ModeloDeMensagem.criar(this.chave, { ...this.valores, [nome]: valor });
  }

  variavel(nome: string): string | undefined {
    return this.valores[nome];
  }

  temVariavel(nome: string): boolean {
    return Object.hasOwn(this.valores, nome);
  }

  /** Copia das variaveis, para o adaptador montar o payload. */
  variaveis(): Readonly<Record<string, string>> {
    return { ...this.valores };
  }
}
