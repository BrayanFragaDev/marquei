export interface ProfissionalDoCatalogo {
  readonly id: string;
  readonly nome: string;
}

/**
 * Lista de profissionais.
 * PENDENCIA: o OpenAPI não tem `GET /v1/profissionais` (nome, serviços, foto). O adaptador
 * simulado descobre os ids pelos horários livres e dá nomes genéricos.
 */
export interface CatalogoDeProfissionais {
  listar(entrada: { servicoId: string | null }): Promise<readonly ProfissionalDoCatalogo[]>;
}
