/** URL base da API. Em desenvolvimento aponta para o mock (`pnpm mock:api`, porta 4010). */
export const URL_DA_API_PADRAO = "http://localhost:4010";

export function urlDaApi(): string {
  const valor = process.env["NEXT_PUBLIC_API_URL"];
  return (valor && valor.length > 0 ? valor : URL_DA_API_PADRAO).replace(/\/+$/, "");
}
