const POR_CODIGO: Readonly<Record<string, number>> = {
  credenciais_invalidas: 401,
  sessao_invalida: 401,
  sessao_expirada: 401,
  tenant_divergente: 403,
  segundo_fator_obrigatorio: 403,
  conta_bloqueada_por_tentativas: 429,
  email_invalido: 400,
  senha_fora_da_politica: 400,
  papel_invalido: 400,
  slug_invalido: 400,
  identificador_invalido: 400,
  instante_invalido: 400,
  dinheiro_invalido: 400,
  janela_de_tempo_invalida: 400,
  agendamento_nao_cancelavel: 409,
  fora_do_prazo_de_cancelamento: 409,
  agendamento_no_passado: 422,
  sem_transacao_com_tenant: 500,
};

const STATUS_PADRAO = 422;

/** Traduz o `codigo` estavel do erro de dominio para HTTP. Codigo novo sem entrada vira 422. */
export function statusDoCodigo(codigo: string): number {
  const exato = POR_CODIGO[codigo];
  if (exato !== undefined) return exato;
  return /_nao_encontrad[ao]$/.test(codigo) ? 404 : STATUS_PADRAO;
}
