const URL_PADRAO_DO_MOCK = "http://localhost:4010";

/**
 * URL base da API. Em desenvolvimento cai no mock (`pnpm mock:api`, porta 4010); em producao a
 * variavel `NEXT_PUBLIC_API_URL` e obrigatoria.
 */
export function urlDaApi(fonte: Record<string, string | undefined> = process.env): string {
  const url = fonte["NEXT_PUBLIC_API_URL"];
  if (url) return url.replace(/\/+$/, "");
  if (fonte["NODE_ENV"] === "production") {
    throw new Error("NEXT_PUBLIC_API_URL nao definida (veja .env.example).");
  }
  return URL_PADRAO_DO_MOCK;
}
