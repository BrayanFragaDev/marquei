import type { EstabelecimentoId } from "./identificador";
import type { Instante } from "./instante";

/**
 * Fato de negocio ja ocorrido. `nome` em snake_case no passado (ex.: `agendamento_criado`).
 * Propriedades carregam apenas ids e valores de negocio, nunca dado pessoal (LGPD).
 */
export interface EventoDeDominio {
  readonly nome: string;
  readonly estabelecimentoId: EstabelecimentoId;
  readonly ocorridoEm: Instante;
  readonly propriedades: Readonly<Record<string, string | number | boolean | null>>;
}
