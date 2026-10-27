/** Layouts de cabecalho curados. */
export const IDS_DE_CABECALHO = ["simples", "centralizado", "capa"] as const;
export type IdDeCabecalho = (typeof IDS_DE_CABECALHO)[number];

/** Layouts de cartao de servico curados. */
export const IDS_DE_CARTAO_DE_SERVICO = ["lista", "destaque", "grade"] as const;
export type IdDeCartaoDeServico = (typeof IDS_DE_CARTAO_DE_SERVICO)[number];
