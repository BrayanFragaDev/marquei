import type { ProfissionalId } from "../catalogo/profissional-id";
import type { EstabelecimentoId } from "../compartilhado/identificador";
import type { HorarioDeTrabalho } from "./horario-de-trabalho";

export interface HorarioDeTrabalhoRepositorio {
  doProfissional(
    estabelecimentoId: EstabelecimentoId,
    profissionalId: ProfissionalId,
  ): Promise<readonly HorarioDeTrabalho[]>;
}
