import type { EstabelecimentoId } from "../compartilhado/identificador";
import type { ProfissionalId } from "./profissional-id";
import type { ProfissionalLeitura } from "./profissional-leitura";
import type { ServicoId } from "./servico-id";

/** Porta de persistencia da equipe. Sempre escopada por estabelecimento. */
export interface ProfissionalRepositorio {
  listarAtivos(estabelecimentoId: EstabelecimentoId): Promise<readonly ProfissionalLeitura[]>;
  listarQueExecutam(
    estabelecimentoId: EstabelecimentoId,
    servicoId: ServicoId,
  ): Promise<readonly ProfissionalLeitura[]>;
  obterPorId(
    estabelecimentoId: EstabelecimentoId,
    id: ProfissionalId,
  ): Promise<ProfissionalLeitura | null>;
}
