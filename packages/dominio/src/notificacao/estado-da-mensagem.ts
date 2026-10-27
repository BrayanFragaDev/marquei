/** `aceita`: o provedor recebeu e vai entregar. `entregue` e `falhou` sao finais. */
export const ESTADOS_DA_MENSAGEM = ["aceita", "entregue", "falhou"] as const;

export type EstadoDaMensagem = (typeof ESTADOS_DA_MENSAGEM)[number];
