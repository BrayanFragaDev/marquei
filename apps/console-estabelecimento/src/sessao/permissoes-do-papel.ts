import { Papel } from "@marquei/dominio";

export type SecaoDoConsole =
  | "painel"
  | "servicos"
  | "equipe"
  | "horarios"
  | "agendamentos"
  | "tema";

const TODAS: readonly SecaoDoConsole[] = [
  "painel",
  "servicos",
  "equipe",
  "horarios",
  "agendamentos",
  "tema",
];

export const ROTA_DA_SECAO: Readonly<Record<SecaoDoConsole, string>> = {
  painel: "/",
  servicos: "/servicos",
  equipe: "/equipe",
  horarios: "/horarios",
  agendamentos: "/agendamentos",
  tema: "/tema",
};

/**
 * O que a interface MOSTRA para cada papel. A API e a autoridade: isto so evita oferecer o que
 * seria recusado com 403.
 */
export class PermissoesDoPapel {
  constructor(private readonly papel: Papel) {}

  podeVer(secao: SecaoDoConsole): boolean {
    return this.papel.gerenciaEstabelecimento() || secao === "agendamentos";
  }

  podeEditar(secao: SecaoDoConsole): boolean {
    if (secao === "agendamentos") return true; // profissional tambem cancela
    return this.papel.gerenciaEstabelecimento() && secao !== "painel";
  }

  secoesVisiveis(): readonly SecaoDoConsole[] {
    return TODAS.filter((secao) => this.podeVer(secao));
  }

  /** Profissional so enxerga a propria agenda. */
  soPropriaAgenda(): boolean {
    return this.papel === Papel.Profissional;
  }

  /** Chave do rotulo do papel no catalogo de mensagens. */
  chaveDoRotulo(): "dono" | "gestor" | "profissional" {
    if (this.papel === Papel.Dono) return "dono";
    return this.papel === Papel.Gestor ? "gestor" : "profissional";
  }

  rotaInicial(): string {
    return ROTA_DA_SECAO[this.secoesVisiveis()[0] ?? "agendamentos"];
  }

  /** Secao a que um caminho pertence (`null` para caminhos fora do console). */
  static secaoDoCaminho(caminho: string): SecaoDoConsole | null {
    if (caminho === "/") return "painel";
    return TODAS.find((s) => s !== "painel" && ehRotaOuFilha(caminho, ROTA_DA_SECAO[s])) ?? null;
  }
}

function ehRotaOuFilha(caminho: string, rota: string): boolean {
  return caminho === rota || caminho.startsWith(`${rota}/`);
}
