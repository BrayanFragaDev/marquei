import { TelefoneBrasileiro } from "../apresentacao/telefone-brasileiro";
import type { ArmazenamentoDeChaves } from "../portas/armazenamento-de-chaves";
import {
  FalhaDeLoginDoCliente,
  type AutenticadorDoCliente,
  type SessaoDoCliente,
} from "../portas/autenticador-do-cliente";

/** Código aceito pelo adaptador simulado (somente desenvolvimento, nunca produção). */
export const CODIGO_DE_TESTE = "123456";

const chaveDaSessao = (slug: string): string => `marquei:cliente:${slug}`;

/**
 * Adaptador SIMULADO para o mock: qualquer celular válido + código de teste. O token do mock é
 * `mock-token-<slug>`. Substituir por um adaptador real quando o OTP entrar no OpenAPI.
 */
export class AutenticadorSimulado implements AutenticadorDoCliente {
  constructor(private readonly armazenamento: ArmazenamentoDeChaves) {}

  async solicitarCodigo(entrada: { slug: string; telefone: string }): Promise<void> {
    if (TelefoneBrasileiro.criar(entrada.telefone) === null) {
      throw new FalhaDeLoginDoCliente("telefone_invalido");
    }
  }

  async confirmarCodigo(entrada: {
    slug: string;
    telefone: string;
    codigo: string;
  }): Promise<SessaoDoCliente> {
    const telefone = TelefoneBrasileiro.criar(entrada.telefone);
    if (telefone === null) throw new FalhaDeLoginDoCliente("telefone_invalido");
    if (entrada.codigo.trim() !== CODIGO_DE_TESTE)
      throw new FalhaDeLoginDoCliente("codigo_invalido");
    const sessao: SessaoDoCliente = {
      token: `mock-token-${entrada.slug}`,
      telefoneMascarado: telefone.mascarado(),
    };
    this.armazenamento.gravar(chaveDaSessao(entrada.slug), JSON.stringify(sessao));
    return sessao;
  }

  sessao(slug: string): SessaoDoCliente | null {
    const bruto = this.armazenamento.ler(chaveDaSessao(slug));
    if (bruto === null) return null;
    try {
      const lido: unknown = JSON.parse(bruto);
      if (ehSessao(lido)) return lido;
    } catch {
      // Conteúdo corrompido equivale a "sem sessão".
    }
    return null;
  }

  tokenDeAcesso(slug: string): string | null {
    return this.sessao(slug)?.token ?? `mock-token-${slug}`;
  }

  sair(slug: string): void {
    this.armazenamento.remover(chaveDaSessao(slug));
  }
}

function ehSessao(valor: unknown): valor is SessaoDoCliente {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "token" in valor &&
    typeof valor.token === "string" &&
    "telefoneMascarado" in valor &&
    typeof valor.telefoneMascarado === "string"
  );
}
