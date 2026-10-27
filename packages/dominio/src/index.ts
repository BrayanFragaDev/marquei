// Registro de exportacoes do dominio. Cada subagente acrescenta APENAS as suas linhas
// (plano.md, secao 4.1); nao reordene nem remova linhas alheias.

// compartilhado (dono: AD)
export { ErroDeDominio } from "./compartilhado/erro-de-dominio";
export { Instante } from "./compartilhado/instante";
export { InstanteInvalidoError } from "./compartilhado/instante-invalido-error";
export type { Relogio } from "./compartilhado/relogio";
export { RelogioFixo } from "./compartilhado/relogio-fixo";
export { Dinheiro } from "./compartilhado/dinheiro";
export { DinheiroInvalidoError } from "./compartilhado/dinheiro-invalido-error";
export { Identificador, EstabelecimentoId } from "./compartilhado/identificador";
export { IdentificadorInvalidoError } from "./compartilhado/identificador-invalido-error";
export type { GeradorDeIdentificador } from "./compartilhado/gerador-de-identificador";
export { GeradorSequencialDeIdentificador } from "./compartilhado/gerador-sequencial-de-identificador";
