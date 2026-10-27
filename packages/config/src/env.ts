import { z } from "zod";

/** Variaveis de ambiente compartilhadas pelo backend. Cada app valida o que usa ao iniciar. */
export const esquemaDoEnv = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  REDIS_URL: z.string().url(),
  API_PORT: z.coerce.number().int().min(1).max(65535).default(3000),
});

export type Env = z.infer<typeof esquemaDoEnv>;

export class EnvInvalidoError extends Error {
  constructor(readonly problemas: readonly string[]) {
    super(`Variaveis de ambiente invalidas ou ausentes:\n - ${problemas.join("\n - ")}`);
    this.name = "EnvInvalidoError";
  }
}

/**
 * Valida e tipa as variaveis de ambiente. Falha com mensagem clara listando
 * cada variavel ausente ou invalida; nunca inclui os valores na mensagem.
 */
export function carregarEnv(fonte: Record<string, string | undefined> = process.env): Env {
  const resultado = esquemaDoEnv.safeParse(fonte);
  if (resultado.success) return resultado.data;

  const problemas = resultado.error.issues.map(
    (issue) => `${issue.path.join(".") || "(raiz)"}: ${issue.message}`,
  );
  throw new EnvInvalidoError(problemas);
}
