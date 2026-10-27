import type { JanelaDeTempo } from "../../agendamento/janela-de-tempo";
import type { ProfissionalId } from "../../catalogo/profissional-id";
import type { EstabelecimentoId } from "../../compartilhado/identificador";
import type { Bloqueio } from "../bloqueio";
import type { BloqueioRepositorio } from "../bloqueio-repositorio";
import type { HorarioDeTrabalho } from "../horario-de-trabalho";
import type { HorarioDeTrabalhoRepositorio } from "../horario-de-trabalho-repositorio";

export class HorarioDeTrabalhoRepositorioEmMemoria implements HorarioDeTrabalhoRepositorio {
  constructor(
    private readonly porEstabelecimento: ReadonlyMap<string, readonly HorarioDeTrabalho[]>,
  ) {}

  doProfissional(
    estabelecimentoId: EstabelecimentoId,
    profissionalId: ProfissionalId,
  ): Promise<readonly HorarioDeTrabalho[]> {
    return Promise.resolve(
      (this.porEstabelecimento.get(estabelecimentoId.valor) ?? []).filter((h) =>
        h.profissionalId.igual(profissionalId),
      ),
    );
  }
}

export class BloqueioRepositorioEmMemoria implements BloqueioRepositorio {
  constructor(private readonly bloqueios: readonly Bloqueio[] = []) {}

  doProfissional(
    estabelecimentoId: EstabelecimentoId,
    profissionalId: ProfissionalId,
    janela: JanelaDeTempo,
  ): Promise<readonly Bloqueio[]> {
    return Promise.resolve(
      this.bloqueios.filter(
        (b) =>
          b.estabelecimentoId.igual(estabelecimentoId) &&
          b.valePara(profissionalId) &&
          b.bloqueia(janela),
      ),
    );
  }
}
