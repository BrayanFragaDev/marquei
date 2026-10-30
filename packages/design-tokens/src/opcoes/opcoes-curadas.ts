import { CAMPOS_DE_COR, type CampoDeCor } from "../esquema/esquema-do-tema";
import { RequisitoDeContraste } from "../contraste/requisito-de-contraste";
import { VERTICAIS, type Vertical } from "../padroes/vertical";
import { ESCALAS_DE_ESPACAMENTO, IDS_DE_DENSIDADE, type EscalaDeEspacamento } from "./densidades";
import { FamiliaTipografica, type IdDeFamilia } from "./familias-tipograficas";
import { IDS_DE_CABECALHO, IDS_DE_CARTAO_DE_SERVICO } from "./presets";
import { ESCALAS_DE_RAIO, IDS_DE_RAIO, type EscalaDeRaio, type IdDeRaio } from "./raios";
import type { IdDeDensidade } from "./densidades";

export interface OpcaoDeFamilia {
  readonly id: IdDeFamilia;
  readonly nome: string;
  readonly pilhaCss: string;
}

export interface OpcaoDeRaio {
  readonly id: IdDeRaio;
  readonly escala: EscalaDeRaio;
}

export interface OpcaoDeDensidade {
  readonly id: IdDeDensidade;
  readonly espacamento: EscalaDeEspacamento;
}

export interface OpcoesCuradas {
  readonly familias: readonly OpcaoDeFamilia[];
  readonly raios: readonly OpcaoDeRaio[];
  readonly densidades: readonly OpcaoDeDensidade[];
  readonly cabecalhos: readonly string[];
  readonly cartoesDeServico: readonly string[];
  readonly camposDeCor: readonly CampoDeCor[];
  readonly verticais: readonly Vertical[];
  /** Razoes minimas WCAG AA exigidas para publicar. */
  readonly contrasteMinimo: { readonly textoNormal: number; readonly componente: number };
}

/** Tudo que o editor de tema pode oferecer; derivado das mesmas listas que o esquema aceita. */
export function catalogoDeOpcoes(): OpcoesCuradas {
  return {
    familias: FamiliaTipografica.todas().map((f) => ({
      id: f.id,
      nome: f.nome,
      pilhaCss: f.pilhaCss(),
    })),
    raios: IDS_DE_RAIO.map((id) => ({ id, escala: ESCALAS_DE_RAIO[id] })),
    densidades: IDS_DE_DENSIDADE.map((id) => ({ id, espacamento: ESCALAS_DE_ESPACAMENTO[id] })),
    cabecalhos: [...IDS_DE_CABECALHO],
    cartoesDeServico: [...IDS_DE_CARTAO_DE_SERVICO],
    camposDeCor: [...CAMPOS_DE_COR],
    verticais: [...VERTICAIS],
    contrasteMinimo: {
      textoNormal: RequisitoDeContraste.TEXTO_NORMAL.razaoMinima,
      componente: RequisitoDeContraste.TEXTO_GRANDE_OU_COMPONENTE.razaoMinima,
    },
  };
}
