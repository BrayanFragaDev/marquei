import type { Mensagens } from "../mensagens/mensagens";

const MS_POR_DIA = 86_400_000;

/** Centavos inteiros -> "R$ 45,00", sem passar por ponto flutuante. */
export function formatarPreco(centavos: number): string {
  const reais = Math.trunc(centavos / 100);
  const resto = String(centavos % 100).padStart(2, "0");
  return `R$ ${reais.toLocaleString("pt-BR")},${resto}`;
}

export class FormatadorDeDuracao {
  constructor(private readonly mensagens: Mensagens) {}

  formatar(totalDeMinutos: number): string {
    const horas = Math.trunc(totalDeMinutos / 60);
    const minutos = totalDeMinutos % 60;
    if (horas === 0) return this.mensagens.t("duracao.minutos", { minutos });
    if (minutos === 0) return this.mensagens.t("duracao.horas", { horas });
    return this.mensagens.t("duracao.horasEMinutos", { horas, minutos });
  }
}

/** Datas e horas na apresentação: instantes UTC viram horário local do estabelecimento. */
export class CalendarioDoEstabelecimento {
  constructor(private readonly fuso: string) {}

  hora(instanteIso: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
      timeZone: this.fuso,
    }).format(new Date(instanteIso));
  }

  /** Dia civil (`YYYY-MM-DD`) do instante, no fuso do estabelecimento. */
  diaCivil(instanteIso: string): string {
    const partes = new Intl.DateTimeFormat("en-CA", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      timeZone: this.fuso,
    }).format(new Date(instanteIso));
    return partes;
  }

  /** Os próximos `quantidade` dias civis, começando hoje no fuso do estabelecimento. */
  proximosDias(agora: Date, quantidade: number): readonly string[] {
    const hoje = this.diaCivil(agora.toISOString());
    const base = Date.parse(`${hoje}T12:00:00Z`);
    return Array.from({ length: quantidade }, (_, i) =>
      new Date(base + i * MS_POR_DIA).toISOString().slice(0, 10),
    );
  }

  /** "seg., 26/10" para um dia civil. */
  rotuloDoDia(diaCivil: string): string {
    return new Intl.DateTimeFormat("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      timeZone: "UTC",
    }).format(new Date(`${diaCivil}T12:00:00Z`));
  }
}
