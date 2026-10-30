import { Instante } from "@marquei/dominio";

export const FUSO_PADRAO = "America/Sao_Paulo";

/** Conversoes de apresentacao para o fuso do estabelecimento (o transporte e sempre UTC). */
export class FusoDoEstabelecimento {
  private readonly dia: Intl.DateTimeFormat;
  private readonly hora: Intl.DateTimeFormat;

  constructor(readonly fuso: string = FUSO_PADRAO) {
    this.dia = new Intl.DateTimeFormat("en-CA", {
      timeZone: fuso,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    this.hora = new Intl.DateTimeFormat("pt-BR", {
      timeZone: fuso,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }

  /** Dia civil `YYYY-MM-DD` de um instante no fuso. */
  diaCivil(instante: Instante): string {
    return this.dia.format(instante.epochMs);
  }

  diaCivilDeIso(iso: string): string {
    return this.diaCivil(Instante.deIso(iso));
  }

  /** Hora local `HH:MM`. */
  horaLocal(iso: string): string {
    return this.hora.format(Instante.deIso(iso).epochMs);
  }

  /** Converte `YYYY-MM-DDTHH:MM` (relogio de parede no fuso) em ISO UTC; `null` se invalido. */
  paraUtc(local: string): string | null {
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(local);
    if (!m) return null;
    const [, ano, mes, dia, hora, minuto] = m.map(Number);
    const ingenuo = Date.UTC(ano ?? 0, (mes ?? 1) - 1, dia ?? 1, hora ?? 0, minuto ?? 0);
    return new Date(ingenuo - this.deslocamentoMs(ingenuo)).toISOString();
  }

  /** Diferenca (relogio de parede no fuso menos UTC) em ms no instante dado. */
  private deslocamentoMs(epochMs: number): number {
    const partes = Object.fromEntries(
      new Intl.DateTimeFormat("en-US", {
        timeZone: this.fuso,
        hourCycle: "h23",
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      })
        .formatToParts(epochMs)
        .map((p) => [p.type, Number(p.value)]),
    );
    const naParede = Date.UTC(partes["year"] ?? 0, (partes["month"] ?? 1) - 1, partes["day"] ?? 1, partes["hour"] ?? 0, partes["minute"] ?? 0);
    return naParede - Math.floor(epochMs / 60_000) * 60_000;
  }

  /** `dd/mm/aaaa` a partir de um dia civil `YYYY-MM-DD`. */
  dataPorExtenso(diaCivil: string): string {
    const [ano, mes, dia] = diaCivil.split("-");
    return `${dia}/${mes}/${ano}`;
  }
}
