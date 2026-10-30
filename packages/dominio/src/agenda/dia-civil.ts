import { DiaCivilInvalidoError } from "./dia-civil-invalido-error";

const PADRAO = /^(\d{4})-(\d{2})-(\d{2})$/;
const MS_POR_DIA = 86_400_000;

/** 0 = domingo ... 6 = sabado. */
export type DiaDaSemana = 0 | 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Dia do calendario sem fuso nem hora (ex.: 2026-10-27). Seu significado em instantes
 * depende do `FusoHorario` do estabelecimento; por si so, e apenas uma data.
 */
export class DiaCivil {
  private constructor(
    readonly ano: number,
    readonly mes: number,
    readonly dia: number,
  ) {}

  static de(ano: number, mes: number, dia: number): DiaCivil {
    const ms = Date.UTC(ano, mes - 1, dia);
    const volta = new Date(ms);
    const confere =
      volta.getUTCFullYear() === ano &&
      volta.getUTCMonth() === mes - 1 &&
      volta.getUTCDate() === dia;
    if (!Number.isInteger(ano) || !Number.isInteger(mes) || !Number.isInteger(dia) || !confere) {
      throw new DiaCivilInvalidoError(`${ano}-${mes}-${dia}`);
    }
    return new DiaCivil(ano, mes, dia);
  }

  static deTexto(texto: string): DiaCivil {
    const partes = PADRAO.exec(texto);
    if (!partes) throw new DiaCivilInvalidoError(texto);
    return DiaCivil.de(Number(partes[1]), Number(partes[2]), Number(partes[3]));
  }

  /** Dia civil que os campos de `epochMsLocal` (UTC deslocado para o fuso) representam. */
  static deEpochMsLocal(epochMsLocal: number): DiaCivil {
    const d = new Date(epochMsLocal);
    return DiaCivil.de(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
  }

  /** Meia-noite deste dia como se os campos locais fossem UTC. Base da conversao de fuso. */
  epochMsLocal(minutosDoDia = 0): number {
    return Date.UTC(this.ano, this.mes - 1, this.dia, 0, minutosDoDia);
  }

  diaDaSemana(): DiaDaSemana {
    return new Date(this.epochMsLocal()).getUTCDay() as DiaDaSemana;
  }

  maisDias(dias: number): DiaCivil {
    return DiaCivil.deEpochMsLocal(this.epochMsLocal() + dias * MS_POR_DIA);
  }

  igual(outro: DiaCivil): boolean {
    return this.paraTexto() === outro.paraTexto();
  }

  paraTexto(): string {
    const dois = (n: number): string => String(n).padStart(2, "0");
    return `${String(this.ano).padStart(4, "0")}-${dois(this.mes)}-${dois(this.dia)}`;
  }

  toString(): string {
    return this.paraTexto();
  }
}
