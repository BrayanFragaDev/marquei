import type { EstabelecimentoId } from "@marquei/dominio";

/** Porta: executa `acao` dentro de uma transacao presa ao tenant (RLS). */
export interface EscopoDeTenant {
  noTenant<T>(tenant: EstabelecimentoId, acao: () => Promise<T>): Promise<T>;
}
