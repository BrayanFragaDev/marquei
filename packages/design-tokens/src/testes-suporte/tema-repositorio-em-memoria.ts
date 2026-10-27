import type { EstabelecimentoId, Instante } from "@marquei/dominio";
import type { TemaRepositorio } from "../persistencia/tema-repositorio";
import { TemaVersionado } from "../persistencia/tema-versionado";
import type { TemaDoEstabelecimento } from "../tema/tema-do-estabelecimento";

type Estado = "rascunho" | "publicado";

/** Fake em memoria para testes de dominio e de casos de uso (sem banco). */
export class TemaRepositorioEmMemoria implements TemaRepositorio {
  private readonly temas = new Map<string, TemaVersionado>();

  obterRascunho(estabelecimento: EstabelecimentoId): Promise<TemaVersionado | null> {
    return Promise.resolve(this.temas.get(this.chave(estabelecimento, "rascunho")) ?? null);
  }

  obterPublicado(estabelecimento: EstabelecimentoId): Promise<TemaVersionado | null> {
    return Promise.resolve(this.temas.get(this.chave(estabelecimento, "publicado")) ?? null);
  }

  salvarRascunho(
    estabelecimento: EstabelecimentoId,
    tema: TemaDoEstabelecimento,
    agora: Instante,
  ): Promise<TemaVersionado> {
    return Promise.resolve(this.gravar(estabelecimento, "rascunho", tema, agora));
  }

  publicar(
    estabelecimento: EstabelecimentoId,
    tema: TemaDoEstabelecimento,
    agora: Instante,
  ): Promise<TemaVersionado> {
    return Promise.resolve(this.gravar(estabelecimento, "publicado", tema, agora));
  }

  private gravar(
    estabelecimento: EstabelecimentoId,
    estado: Estado,
    tema: TemaDoEstabelecimento,
    agora: Instante,
  ): TemaVersionado {
    const chave = this.chave(estabelecimento, estado);
    const versao = (this.temas.get(chave)?.versao ?? 0) + 1;
    const novo = TemaVersionado.reconstituir({ tema, versao, atualizadoEm: agora });
    this.temas.set(chave, novo);
    return novo;
  }

  private chave(estabelecimento: EstabelecimentoId, estado: Estado): string {
    return `${estabelecimento.valor}:${estado}`;
  }
}
