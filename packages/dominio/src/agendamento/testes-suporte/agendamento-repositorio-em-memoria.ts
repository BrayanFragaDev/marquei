import type { ProfissionalId } from "../../catalogo/profissional-id";
import type { EstabelecimentoId } from "../../compartilhado/identificador";
import { HorarioIndisponivelError } from "../../agenda/horario-indisponivel-error";
import type { Agendamento } from "../agendamento";
import type { AgendamentoId } from "../agendamento-id";
import { AgendamentoNaoEncontradoError } from "../agendamento-nao-encontrado-error";
import type { AgendamentoRepositorio } from "../agendamento-repositorio";
import type { JanelaDeTempo } from "../janela-de-tempo";

/** Fake em memoria que imita a restricao de exclusao do banco ao salvar. */
export class AgendamentoRepositorioEmMemoria implements AgendamentoRepositorio {
  private readonly porId = new Map<string, Agendamento>();

  obterPorId(estabelecimentoId: EstabelecimentoId, id: AgendamentoId): Promise<Agendamento> {
    const a = this.porId.get(id.valor);
    if (!a?.estabelecimentoId.igual(estabelecimentoId)) {
      return Promise.reject(new AgendamentoNaoEncontradoError());
    }
    return Promise.resolve(a);
  }

  listarOcupantes(
    estabelecimentoId: EstabelecimentoId,
    profissionalId: ProfissionalId,
    janela: JanelaDeTempo,
  ): Promise<readonly Agendamento[]> {
    return Promise.resolve(
      [...this.porId.values()].filter(
        (a) =>
          a.estabelecimentoId.igual(estabelecimentoId) &&
          a.profissionalId.igual(profissionalId) &&
          a.ocupaHorario() &&
          a.janelaOcupada().sobrepoe(janela),
      ),
    );
  }

  salvar(agendamento: Agendamento): Promise<void> {
    const conflito = [...this.porId.values()].some(
      (a) =>
        !a.id.igual(agendamento.id) &&
        agendamento.ocupaHorario() &&
        a.ocupaHorario() &&
        a.profissionalId.igual(agendamento.profissionalId) &&
        a.janelaOcupada().sobrepoe(agendamento.janelaOcupada()),
    );
    if (conflito) return Promise.reject(new HorarioIndisponivelError());
    this.porId.set(agendamento.id.valor, agendamento);
    return Promise.resolve();
  }

  todos(): readonly Agendamento[] {
    return [...this.porId.values()];
  }
}
