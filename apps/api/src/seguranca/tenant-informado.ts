import { TenantDivergenteError, type EstabelecimentoId } from "@marquei/dominio";
import type { RequisicaoHttp } from "./requisicao-http";

const HEADERS = ["x-tenant-id", "x-estabelecimento-id", "x-tenant"];
const CAMPOS = [
  "estabelecimentoId",
  "estabelecimento_id",
  "tenantId",
  "tenant_id",
  "tenant",
  "estabelecimento",
];

function doObjeto(origem: unknown, nomes: readonly string[]): unknown[] {
  if (typeof origem !== "object" || origem === null) return [];
  const registro = origem as Record<string, unknown>;
  return nomes.flatMap((nome) => (nome in registro ? [registro[nome]] : []));
}

/** Tudo que o cliente declarou como "tenant" (header, rota, query, corpo). Serve so para REJEITAR. */
export function tenantsInformados(requisicao: RequisicaoHttp): unknown[] {
  const headers = HEADERS.map((h) => requisicao.headers[h]).filter((v) => v !== undefined);
  const dados = [
    ...headers,
    ...doObjeto(requisicao.params, CAMPOS),
    ...doObjeto(requisicao.query, CAMPOS),
    ...doObjeto(requisicao.body, CAMPOS),
  ];
  return dados.flatMap((v) => (Array.isArray(v) ? (v as unknown[]) : [v]));
}

/**
 * O tenant vale somente o do token. Qualquer valor informado pelo cliente que nao seja
 * exatamente o da sessao (inclusive tipos estranhos) e rejeitado; igual e simplesmente ignorado.
 */
export function exigirSemDivergencia(requisicao: RequisicaoHttp, tenant: EstabelecimentoId): void {
  for (const informado of tenantsInformados(requisicao)) {
    if (typeof informado !== "string" || informado.trim().toLowerCase() !== tenant.valor) {
      throw new TenantDivergenteError();
    }
  }
}
