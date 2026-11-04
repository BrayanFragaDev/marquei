import type { ArmazenamentoDeChaves } from "./armazenamento-de-chaves";

export interface SessaoDoProfissional {
  readonly token: string;
  readonly papel: string;
}

const chave = (slug: string): string => `marquei:profissional:${slug}`;

/** Sessão do modo profissional (login por e-mail e senha em `/v1/auth/login`). */
export class RepositorioDeSessaoDoProfissional {
  constructor(private readonly armazenamento: ArmazenamentoDeChaves) {}

  ler(slug: string): SessaoDoProfissional | null {
    const bruto = this.armazenamento.ler(chave(slug));
    if (bruto === null) return null;
    try {
      const lido: unknown = JSON.parse(bruto);
      if (typeof lido === "object" && lido !== null && "token" in lido && "papel" in lido) {
        const { token, papel } = lido;
        if (typeof token === "string" && typeof papel === "string") return { token, papel };
      }
    } catch {
      // Conteúdo corrompido equivale a "sem sessão".
    }
    return null;
  }

  gravar(slug: string, sessao: SessaoDoProfissional): void {
    this.armazenamento.gravar(chave(slug), JSON.stringify(sessao));
  }

  sair(slug: string): void {
    this.armazenamento.remover(chave(slug));
  }
}
