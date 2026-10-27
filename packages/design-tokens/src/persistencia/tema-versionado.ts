import type { Instante } from "@marquei/dominio";
import type { TemaDoEstabelecimento } from "../tema/tema-do-estabelecimento";
import { VersaoDeTemaInvalidaError } from "./versao-de-tema-invalida-error";

export interface DadosDoTemaVersionado {
  readonly tema: TemaDoEstabelecimento;
  readonly versao: number;
  readonly atualizadoEm: Instante | null;
}

/**
 * Tema com a versao sob a qual foi salvo. Versao 0 significa "padrao da vertical, nunca salvo"
 * (nesse caso nao ha data de atualizacao).
 */
export class TemaVersionado {
  private constructor(
    readonly tema: TemaDoEstabelecimento,
    readonly versao: number,
    readonly atualizadoEm: Instante | null,
  ) {}

  static reconstituir(dados: DadosDoTemaVersionado): TemaVersionado {
    if (!Number.isInteger(dados.versao) || dados.versao < 0) {
      throw new VersaoDeTemaInvalidaError(dados.versao);
    }
    return new TemaVersionado(dados.tema, dados.versao, dados.atualizadoEm);
  }

  static padrao(tema: TemaDoEstabelecimento): TemaVersionado {
    return new TemaVersionado(tema, 0, null);
  }

  get ehPadrao(): boolean {
    return this.versao === 0;
  }
}
