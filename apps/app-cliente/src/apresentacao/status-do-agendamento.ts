import type { ChaveDeMensagem } from "../mensagens/catalogo-pt-br";

/** Chave do catálogo com o rótulo de cada status do agendamento. */
export const CHAVE_DO_STATUS = {
  confirmado: "meus.statusConfirmado",
  cancelado: "meus.statusCancelado",
  concluido: "meus.statusConcluido",
} as const satisfies Record<string, ChaveDeMensagem>;
