import type { ArmazenamentoDeChaves } from "../portas/armazenamento-de-chaves";

/** `localStorage`, com try/catch: navegação privada ou dados bloqueados não quebram a tela. */
export class ArmazenamentoLocal implements ArmazenamentoDeChaves {
  ler(chave: string): string | null {
    try {
      return window.localStorage.getItem(chave);
    } catch {
      return null;
    }
  }

  gravar(chave: string, valor: string): void {
    try {
      window.localStorage.setItem(chave, valor);
    } catch {
      // Sem armazenamento disponível: a tela segue funcionando sem persistir.
    }
  }

  remover(chave: string): void {
    try {
      window.localStorage.removeItem(chave);
    } catch {
      // Idem.
    }
  }
}

export class ArmazenamentoEmMemoria implements ArmazenamentoDeChaves {
  private readonly itens = new Map<string, string>();

  ler(chave: string): string | null {
    return this.itens.get(chave) ?? null;
  }
  gravar(chave: string, valor: string): void {
    this.itens.set(chave, valor);
  }
  remover(chave: string): void {
    this.itens.delete(chave);
  }
}
