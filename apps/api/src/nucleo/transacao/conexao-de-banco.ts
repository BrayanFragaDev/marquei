export interface ResultadoDeConsulta<L> {
  readonly linhas: readonly L[];
  readonly quantidade: number;
}

/** Visao minima da conexao dentro de uma transacao. Repositorios dependem so disto. */
export interface ConexaoDeBanco {
  consultar<L extends object = Record<string, unknown>>(
    sql: string,
    parametros?: readonly unknown[],
  ): Promise<ResultadoDeConsulta<L>>;
}
