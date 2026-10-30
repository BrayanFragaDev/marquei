/** Destino de retorno após o login: só caminhos internos do próprio estabelecimento. */
export function destinoSeguro(slug: string, candidato: string | null): string {
  const inicio = `/${slug}`;
  if (candidato === null || candidato.startsWith("//") || candidato.includes("\\")) return inicio;
  const interno =
    candidato === inicio ||
    candidato.startsWith(`${inicio}/`) ||
    candidato.startsWith(`${inicio}?`);
  return interno ? candidato : inicio;
}
