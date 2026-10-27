const TAMANHO_MINIMO = 32;

export class SegredoJwtInvalidoError extends Error {
  constructor(variavel: string, motivo: string) {
    super(`Variavel ${variavel} invalida: ${motivo}.`);
    this.name = "SegredoJwtInvalidoError";
  }
}

/**
 * Segredos de assinatura dos JWT (um por audiencia). Nunca ficam no repositorio. A leitura e
 * sob demanda; em producao `validar()` roda na subida para falhar cedo.
 */
export class SegredosJwt {
  constructor(private readonly fonte: Record<string, string | undefined>) {}

  estabelecimento(): string {
    return this.ler("JWT_SEGREDO_ESTABELECIMENTO");
  }

  plataforma(): string {
    return this.ler("JWT_SEGREDO_PLATAFORMA");
  }

  validar(): void {
    const a = this.estabelecimento();
    const b = this.plataforma();
    if (a === b) {
      throw new SegredoJwtInvalidoError(
        "JWT_SEGREDO_PLATAFORMA",
        "deve ser distinto do segredo do estabelecimento",
      );
    }
  }

  private ler(variavel: string): string {
    const valor = this.fonte[variavel];
    if (!valor) throw new SegredoJwtInvalidoError(variavel, "ausente");
    if (valor.length < TAMANHO_MINIMO) {
      throw new SegredoJwtInvalidoError(
        variavel,
        `precisa ter ao menos ${TAMANHO_MINIMO} caracteres`,
      );
    }
    return valor;
  }
}
