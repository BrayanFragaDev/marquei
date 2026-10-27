import type { ProfissionalId } from "./profissional-id";
import { ProfissionalInvalidoError } from "./profissional-invalido-error";
import { ProfissionalNaoExecutaServicoError } from "./profissional-nao-executa-servico-error";
import type { ServicoId } from "./servico-id";

export interface DadosDoProfissional {
  readonly id: ProfissionalId;
  readonly nome: string;
  readonly servicosIds: readonly ServicoId[];
  readonly ativo?: boolean;
}

/** Quem atende: sabe quais servicos executa e se esta ativo. */
export class Profissional {
  private constructor(
    readonly id: ProfissionalId,
    readonly nome: string,
    readonly servicosIds: readonly ServicoId[],
    readonly ativo: boolean,
  ) {}

  static criar(dados: DadosDoProfissional): Profissional {
    const nome = dados.nome.trim();
    if (nome === "") throw new ProfissionalInvalidoError("o nome e obrigatorio");
    const unicos = dados.servicosIds.filter(
      (s, i, todos) => todos.findIndex((outro) => outro.igual(s)) === i,
    );
    return new Profissional(dados.id, nome, unicos, dados.ativo ?? true);
  }

  static reconstituir(dados: DadosDoProfissional): Profissional {
    return Profissional.criar(dados);
  }

  executa(servicoId: ServicoId): boolean {
    return this.servicosIds.some((s) => s.igual(servicoId));
  }

  /** Pode receber agendamentos deste servico: ativo e habilitado nele. */
  atende(servicoId: ServicoId): boolean {
    return this.ativo && this.executa(servicoId);
  }

  exigirExecucaoDe(servicoId: ServicoId): void {
    if (!this.executa(servicoId)) throw new ProfissionalNaoExecutaServicoError();
  }

  comServico(servicoId: ServicoId): Profissional {
    return this.com({ servicosIds: [...this.servicosIds, servicoId] });
  }

  semServico(servicoId: ServicoId): Profissional {
    return this.com({ servicosIds: this.servicosIds.filter((s) => !s.igual(servicoId)) });
  }

  renomear(nome: string): Profissional {
    return this.com({ nome });
  }

  desativar(): Profissional {
    return this.com({ ativo: false });
  }

  ativar(): Profissional {
    return this.com({ ativo: true });
  }

  private com(mudanca: Partial<DadosDoProfissional>): Profissional {
    return Profissional.criar({
      id: this.id,
      nome: this.nome,
      servicosIds: this.servicosIds,
      ativo: this.ativo,
      ...mudanca,
    });
  }
}
