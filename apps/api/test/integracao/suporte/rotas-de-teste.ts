import { Body, Controller, Get, Module, Param, Post } from "@nestjs/common";
import type { Sessao } from "@marquei/dominio";
import { ProvedorDeTransacao } from "../../../src/nucleo";
import { SessaoAtual } from "../../../src/seguranca/decoradores/sessao-atual";
import { SomenteOperador } from "../../../src/seguranca/decoradores/somente-operador";

/** Rotas existentes so nos testes: leem o banco SEM filtrar tenant no SQL, para provar a RLS por sessao. */
@Controller("teste")
export class RotasDeTesteController {
  constructor(private readonly transacao: ProvedorDeTransacao) {}

  @Get("servicos")
  async servicos(): Promise<{ ids: string[] }> {
    const r = await this.transacao.atual().consultar<{ id: string }>("SELECT id FROM servico");
    return { ids: r.linhas.map((l) => l.id) };
  }

  @Post("eco")
  eco(@Body() corpo: unknown): { corpo: unknown } {
    return { corpo };
  }

  @Get("estabelecimento/:estabelecimentoId/ping")
  ping(@Param("estabelecimentoId") id: string): { id: string } {
    return { id };
  }

  @Get("sessao")
  sessao(@SessaoAtual() sessao: Sessao): { papel: string; tenant: string | null } {
    return { papel: sessao.papel.nome, tenant: sessao.tenant?.valor ?? null };
  }

  @SomenteOperador()
  @Get("operador/estabelecimentos")
  async estabelecimentos(): Promise<{ total: number }> {
    const r = await this.transacao
      .atual()
      .consultar<{ n: string }>("SELECT count(*) AS n FROM estabelecimento");
    return { total: Number(r.linhas[0]?.n ?? 0) };
  }
}

@Module({ controllers: [RotasDeTesteController] })
export class RotasDeTesteModule {}
