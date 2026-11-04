import type { AgendamentoDaAgenda } from "../../contratos/agenda";
import type {
  Bloqueio,
  Folga,
  JanelaSemanal,
  MembroDaEquipe,
  ServicoDoCatalogo,
} from "../../contratos/catalogo";

declare global {
  // Estado compartilhado entre bundles do servidor Next em desenvolvimento (so adaptadores provisorios).
  // eslint-disable-next-line no-var
  var __marqueiCeArmazem: ArmazemProvisorio | undefined;
}

export interface AgendaMutavel {
  janelas: JanelaSemanal[];
  folgas: Folga[];
  bloqueios: Bloqueio[];
}

/**
 * Guarda em memoria, por estabelecimento, o que a API ainda nao persiste (servicos, equipe,
 * horarios, agendamentos listados). PROVISORIO: some quando o servidor reinicia e deixa de existir
 * quando o BN publicar os endpoints (ver relatorio do CE-1).
 */
export class ArmazemProvisorio {
  readonly servicos = new Map<string, ServicoDoCatalogo[]>();
  readonly equipe = new Map<string, MembroDaEquipe[]>();
  readonly agendas = new Map<string, AgendaMutavel>();
  readonly agendamentos = new Map<string, AgendamentoDaAgenda[]>();

  static compartilhado(): ArmazemProvisorio {
    globalThis.__marqueiCeArmazem ??= new ArmazemProvisorio();
    return globalThis.__marqueiCeArmazem;
  }
}

export function obterOu<V>(mapa: Map<string, V>, chave: string, semente: () => V): V {
  const existente = mapa.get(chave);
  if (existente) return existente;
  const novo = semente();
  mapa.set(chave, novo);
  return novo;
}
