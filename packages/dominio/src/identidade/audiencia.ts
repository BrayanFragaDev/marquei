/** Para quem um token e emitido. Cada audiencia tem segredo proprio (token de uma nunca vale na outra). */
export const Audiencia = {
  ConsoleEstabelecimento: "console-estabelecimento",
  ConsolePlataforma: "console-plataforma",
  AppCliente: "app-cliente",
} as const;

export type Audiencia = (typeof Audiencia)[keyof typeof Audiencia];
