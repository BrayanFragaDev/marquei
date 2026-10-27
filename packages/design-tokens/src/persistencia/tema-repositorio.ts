import type { EstabelecimentoId, Instante } from "@marquei/dominio";
import type { TemaDoEstabelecimento } from "../tema/tema-do-estabelecimento";
import type { TemaVersionado } from "./tema-versionado";

/**
 * Porta de persistencia dos dois estados do tema: um rascunho e um publicado por
 * estabelecimento. Toda operacao exige o `EstabelecimentoId` (vindo da sessao); a
 * implementacao ainda conta com a RLS do banco como segunda trava.
 */
export interface TemaRepositorio {
  obterRascunho(estabelecimento: EstabelecimentoId): Promise<TemaVersionado | null>;
  obterPublicado(estabelecimento: EstabelecimentoId): Promise<TemaVersionado | null>;
  /** Cria ou substitui o rascunho; a versao do rascunho sempre cresce. */
  salvarRascunho(
    estabelecimento: EstabelecimentoId,
    tema: TemaDoEstabelecimento,
    agora: Instante,
  ): Promise<TemaVersionado>;
  /** Cria ou substitui o publicado com `tema`; a versao publicada sempre cresce. */
  publicar(
    estabelecimento: EstabelecimentoId,
    tema: TemaDoEstabelecimento,
    agora: Instante,
  ): Promise<TemaVersionado>;
}
