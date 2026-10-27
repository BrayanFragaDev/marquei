export const CANAIS_DE_MENSAGEM = ["sms", "whatsapp", "push", "email"] as const;

/** Meio pelo qual uma mensagem chega ao destinatario. */
export type CanalDeMensagem = (typeof CANAIS_DE_MENSAGEM)[number];
