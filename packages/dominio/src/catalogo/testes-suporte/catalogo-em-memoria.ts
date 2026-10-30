import type { EstabelecimentoId } from "../../compartilhado/identificador";
import type { EstabelecimentoLeitura } from "../estabelecimento-leitura";
import type { EstabelecimentoRepositorio } from "../estabelecimento-repositorio";
import type { Profissional } from "../profissional";
import type { ProfissionalId } from "../profissional-id";
import type { ProfissionalRepositorio } from "../profissional-repositorio";
import type { Servico } from "../servico";
import type { ServicoId } from "../servico-id";
import type { ServicoRepositorio } from "../servico-repositorio";

export class ServicoRepositorioEmMemoria implements ServicoRepositorio {
  constructor(private readonly itens: ReadonlyMap<string, readonly Servico[]>) {}

  listarAtivos(estabelecimentoId: EstabelecimentoId): Promise<readonly Servico[]> {
    return Promise.resolve((this.itens.get(estabelecimentoId.valor) ?? []).filter((s) => s.ativo));
  }

  obterPorId(estabelecimentoId: EstabelecimentoId, id: ServicoId): Promise<Servico | null> {
    const achado = (this.itens.get(estabelecimentoId.valor) ?? []).find((s) => s.id.igual(id));
    return Promise.resolve(achado ?? null);
  }
}

export class ProfissionalRepositorioEmMemoria implements ProfissionalRepositorio {
  constructor(private readonly itens: ReadonlyMap<string, readonly Profissional[]>) {}

  listarAtivos(estabelecimentoId: EstabelecimentoId): Promise<readonly Profissional[]> {
    return Promise.resolve((this.itens.get(estabelecimentoId.valor) ?? []).filter((p) => p.ativo));
  }

  listarQueExecutam(
    estabelecimentoId: EstabelecimentoId,
    servicoId: ServicoId,
  ): Promise<readonly Profissional[]> {
    return Promise.resolve(
      (this.itens.get(estabelecimentoId.valor) ?? []).filter((p) => p.atende(servicoId)),
    );
  }

  obterPorId(
    estabelecimentoId: EstabelecimentoId,
    id: ProfissionalId,
  ): Promise<Profissional | null> {
    const achado = (this.itens.get(estabelecimentoId.valor) ?? []).find((p) => p.id.igual(id));
    return Promise.resolve(achado ?? null);
  }
}

export class EstabelecimentoRepositorioEmMemoria implements EstabelecimentoRepositorio {
  constructor(private readonly itens: readonly EstabelecimentoLeitura[]) {}

  obterPorId(id: EstabelecimentoId): Promise<EstabelecimentoLeitura | null> {
    return Promise.resolve(this.itens.find((e) => e.id.igual(id)) ?? null);
  }
}
