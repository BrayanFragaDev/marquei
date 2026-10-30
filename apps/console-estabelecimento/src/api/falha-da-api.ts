export interface DetalheDaFalha {
  readonly campo: string;
  readonly codigo: string;
  readonly mensagem?: string;
  readonly sugestao?: string;
}

const ehObjeto = (v: unknown): v is object => typeof v === "object" && v !== null;

function lerDetalhes(corpo: Record<string, unknown>): readonly DetalheDaFalha[] {
  const bruto = corpo["detalhes"];
  if (!Array.isArray(bruto)) return [];
  return bruto.flatMap((item: unknown): DetalheDaFalha[] => {
    if (!ehObjeto(item)) return [];
    const { campo, codigo, mensagem, sugestao } = Object.fromEntries(Object.entries(item));
    if (typeof campo !== "string" || typeof codigo !== "string") return [];
    return [
      {
        campo,
        codigo,
        ...(typeof mensagem === "string" ? { mensagem } : {}),
        ...(typeof sugestao === "string" ? { sugestao } : {}),
      },
    ];
  });
}

/** Resposta de erro da API (status + `codigo` estavel). Decida pelo `codigo`, nunca pela mensagem. */
export class FalhaDaApi extends Error {
  private constructor(
    readonly status: number,
    readonly codigo: string,
    readonly detalhes: readonly DetalheDaFalha[],
  ) {
    super(`Falha da API (${status}): ${codigo}`);
    this.name = "FalhaDaApi";
  }

  static deResposta(status: number, corpo: unknown): FalhaDaApi {
    const campos: Record<string, unknown> = ehObjeto(corpo)
      ? Object.fromEntries(Object.entries(corpo))
      : {};
    const codigo = typeof campos["codigo"] === "string" ? campos["codigo"] : "erro_desconhecido";
    return new FalhaDaApi(status, codigo, lerDetalhes(campos));
  }

  ehSessaoInvalida(): boolean {
    return this.status === 401;
  }

  ehSemPermissao(): boolean {
    return this.status === 403;
  }
}

/** Extrai `data` de uma resposta do openapi-fetch ou lanca `FalhaDaApi`. */
export function desembrulhar<D>(resposta: {
  readonly data?: D | undefined;
  readonly error?: unknown;
  readonly response: Response;
}): D {
  if (resposta.data !== undefined) return resposta.data;
  throw FalhaDaApi.deResposta(resposta.response.status, resposta.error);
}
