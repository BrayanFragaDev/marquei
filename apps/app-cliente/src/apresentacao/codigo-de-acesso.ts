const PADRAO = /^[a-z0-9](?:[a-z0-9-]{1,61})[a-z0-9]$/;

/** Código (slug) do estabelecimento digitado pelo cliente; mesma regra do contrato da API. */
export class CodigoDeAcesso {
  private constructor(readonly valor: string) {}

  static criar(entrada: string): CodigoDeAcesso | null {
    const normalizado = entrada.trim().toLowerCase();
    return PADRAO.test(normalizado) ? new CodigoDeAcesso(normalizado) : null;
  }
}
