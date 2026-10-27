import {
  SenhaForaDaPoliticaError,
  type MotivoDeSenhaRecusada,
} from "./senha-fora-da-politica-error";

const MINIMO = 10;
const MAXIMO = 128;
const MAXIMO_DA_TENTATIVA = 1024;
const OCULTO = "[senha oculta]";
const INSPECIONAR = Symbol.for("nodejs.util.inspect.custom");

const COMUNS: ReadonlySet<string> = new Set([
  "senha12345",
  "senha123456",
  "senha@12345",
  "password",
  "password1",
  "password12",
  "password123",
  "qwertyuiop",
  "qwerty1234",
  "qwerty12345",
  "1q2w3e4r5t",
  "1qaz2wsx3e",
  "mudar12345",
  "admin12345",
  "administrador",
  "abc1234567",
  "brasil1234",
  "123456789a",
  "a123456789",
]);

function ehSequencia(texto: string): boolean {
  const codigos = Array.from(texto, (c) => c.codePointAt(0) ?? 0);
  const passos = codigos.slice(1).map((c, i) => c - (codigos[i] ?? 0));
  return passos.every((p) => p === 1) || passos.every((p) => p === -1);
}

/**
 * Senha digitada pelo usuario. Nunca aparece em log: toString, JSON e inspect devolvem um
 * marcador. So `revelar()` expoe o valor, e apenas o adaptador de hash deve chama-lo.
 */
export class SenhaEmTexto {
  readonly #valor: string;

  private constructor(valor: string) {
    this.#valor = valor;
  }

  /** Cadastro e troca de senha: aplica a politica (minimo 10, sem so numeros, sem triviais). */
  static nova(texto: string): SenhaEmTexto {
    const motivo = SenhaEmTexto.motivoDeRecusa(texto);
    if (motivo) throw new SenhaForaDaPoliticaError(motivo);
    return new SenhaEmTexto(texto);
  }

  /** Login: nao aplica a politica (a conta pode ser antiga), so limita o tamanho. */
  static deTentativa(texto: string): SenhaEmTexto {
    if (texto.length === 0) throw new SenhaForaDaPoliticaError("vazia");
    if (texto.length > MAXIMO_DA_TENTATIVA) throw new SenhaForaDaPoliticaError("muito_longa");
    return new SenhaEmTexto(texto);
  }

  private static motivoDeRecusa(texto: string): MotivoDeSenhaRecusada | null {
    if (texto.length === 0) return "vazia";
    if (texto.length < MINIMO) return "muito_curta";
    if (texto.length > MAXIMO) return "muito_longa";
    if (/^\d+$/.test(texto)) return "so_numeros";
    if (COMUNS.has(texto.toLowerCase())) return "comum";
    if (new Set(texto).size === 1 || ehSequencia(texto.toLowerCase()))
      return "repeticao_ou_sequencia";
    return null;
  }

  revelar(): string {
    return this.#valor;
  }

  toString(): string {
    return OCULTO;
  }

  toJSON(): string {
    return OCULTO;
  }

  [INSPECIONAR](): string {
    return OCULTO;
  }
}
