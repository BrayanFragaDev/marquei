export interface SessaoDoCliente {
  readonly token: string;
  readonly telefoneMascarado: string;
}

export type CodigoDeFalhaDeLogin = "telefone_invalido" | "codigo_invalido";

export class FalhaDeLoginDoCliente extends Error {
  constructor(readonly codigo: CodigoDeFalhaDeLogin) {
    super(codigo);
    this.name = "FalhaDeLoginDoCliente";
  }
}

/**
 * Porta do login do cliente final por celular + OTP.
 * PENDENCIA: o OpenAPI ainda não tem OTP (AS). Até lá só existe o adaptador simulado.
 */
export interface AutenticadorDoCliente {
  solicitarCodigo(entrada: { slug: string; telefone: string }): Promise<void>;
  confirmarCodigo(entrada: {
    slug: string;
    telefone: string;
    codigo: string;
  }): Promise<SessaoDoCliente>;
  sessao(slug: string): SessaoDoCliente | null;
  /**
   * Token usado para ler o catálogo. PENDENCIA: `GET /v1/servicos` exige sessão; sem rota pública
   * o visitante navega com um token de visitante (simulado). Some quando a API expuser o catálogo.
   */
  tokenDeAcesso(slug: string): string | null;
  sair(slug: string): void;
}
