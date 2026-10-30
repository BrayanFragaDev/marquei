import type { Agendamento } from "../api/gateway-da-api";
import type { AgendamentosDoCliente } from "../portas/agendamentos-do-cliente";
import type { ArmazenamentoDeChaves } from "../portas/armazenamento-de-chaves";

const chave = (slug: string): string => `marquei:agendamentos:${slug}`;

/** Adaptador SIMULADO (localStorage) para `AgendamentosDoCliente`. Guarda ids, nunca dados pessoais. */
export class AgendamentosLocais implements AgendamentosDoCliente {
  constructor(private readonly armazenamento: ArmazenamentoDeChaves) {}

  listar(slug: string): readonly Agendamento[] {
    const bruto = this.armazenamento.ler(chave(slug));
    if (bruto === null) return [];
    try {
      const lido: unknown = JSON.parse(bruto);
      return Array.isArray(lido) ? lido.filter(ehAgendamento) : [];
    } catch {
      return [];
    }
  }

  registrar(slug: string, agendamento: Agendamento): void {
    const outros = this.listar(slug).filter((a) => a.id !== agendamento.id);
    this.salvar(slug, [...outros, agendamento]);
  }

  atualizar(slug: string, agendamento: Agendamento): void {
    this.salvar(
      slug,
      this.listar(slug).map((a) => (a.id === agendamento.id ? agendamento : a)),
    );
  }

  private salvar(slug: string, itens: readonly Agendamento[]): void {
    this.armazenamento.gravar(chave(slug), JSON.stringify(itens));
  }
}

function ehAgendamento(valor: unknown): valor is Agendamento {
  return (
    typeof valor === "object" &&
    valor !== null &&
    "id" in valor &&
    typeof valor.id === "string" &&
    "inicio" in valor &&
    typeof valor.inicio === "string" &&
    "status" in valor &&
    typeof valor.status === "string"
  );
}
