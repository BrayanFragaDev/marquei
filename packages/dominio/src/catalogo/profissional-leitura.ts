import type { ProfissionalId } from "./profissional-id";
import type { ServicoId } from "./servico-id";

/** Tipo de leitura (projecao) de um profissional e dos servicos que ele executa. */
export interface ProfissionalLeitura {
  readonly id: ProfissionalId;
  readonly nome: string;
  readonly servicosIds: readonly ServicoId[];
  readonly ativo: boolean;
}
