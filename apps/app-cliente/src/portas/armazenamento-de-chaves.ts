/** Guarda pequenos textos no dispositivo (sessão, lista local). Falha em silêncio se bloqueado. */
export interface ArmazenamentoDeChaves {
  ler(chave: string): string | null;
  gravar(chave: string, valor: string): void;
  remover(chave: string): void;
}
