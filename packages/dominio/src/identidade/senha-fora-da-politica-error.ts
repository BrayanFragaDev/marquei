import { ErroDeDominio } from "../compartilhado/erro-de-dominio";

export type MotivoDeSenhaRecusada =
  "vazia" | "muito_curta" | "muito_longa" | "so_numeros" | "comum" | "repeticao_ou_sequencia";

/** Nunca carrega a senha: apenas o motivo estavel, seguro para devolver ao usuario. */
export class SenhaForaDaPoliticaError extends ErroDeDominio {
  readonly codigo = "senha_fora_da_politica";

  constructor(readonly motivo: MotivoDeSenhaRecusada) {
    super(`Senha fora da politica: ${motivo}.`);
  }
}
