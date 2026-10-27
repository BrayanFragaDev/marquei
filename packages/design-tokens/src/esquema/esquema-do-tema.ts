import { z } from "zod";
import { PADRAO_DE_COR_HEX } from "../cor/cor-hex";
import { IDS_DE_DENSIDADE } from "../opcoes/densidades";
import { IDS_DE_FAMILIA } from "../opcoes/familias-tipograficas";
import { IDS_DE_CABECALHO, IDS_DE_CARTAO_DE_SERVICO } from "../opcoes/presets";
import { IDS_DE_RAIO } from "../opcoes/raios";

const cor = z.string().regex(PADRAO_DE_COR_HEX, "Cor deve estar no formato #rrggbb.");
const texto = (maximo: number) =>
  z.string().trim().min(1, "Texto obrigatorio.").max(maximo, `No maximo ${maximo} caracteres.`);

export const esquemaDeCores = z.strictObject({
  primaria: cor,
  textoSobrePrimaria: cor,
  apoio: cor,
  fundo: cor,
  superficie: cor,
  texto: cor,
  textoSuave: cor,
});

const esquemaDeTermo = z.strictObject({ singular: texto(30), plural: texto(30) });

export const esquemaDeVocabulario = z.strictObject({
  profissional: esquemaDeTermo,
  servico: esquemaDeTermo,
  agendamento: esquemaDeTermo,
});

export const esquemaDeTextos = z.strictObject({
  boasVindas: texto(120),
  confirmacao: texto(240),
});

/** Esquema unico do tema. So aceita opcoes curadas: nao ha campo livre de fonte ou raio. */
export const esquemaDoTema = z.strictObject({
  cores: esquemaDeCores,
  familia: z.enum(IDS_DE_FAMILIA),
  raio: z.enum(IDS_DE_RAIO),
  densidade: z.enum(IDS_DE_DENSIDADE),
  cabecalho: z.enum(IDS_DE_CABECALHO),
  cartaoDeServico: z.enum(IDS_DE_CARTAO_DE_SERVICO),
  textos: esquemaDeTextos,
  vocabulario: esquemaDeVocabulario,
});

export type DadosDeCores = z.output<typeof esquemaDeCores>;
export type DadosDeTermo = z.output<typeof esquemaDeTermo>;
export type DadosDeVocabulario = z.output<typeof esquemaDeVocabulario>;
export type DadosDeTextos = z.output<typeof esquemaDeTextos>;
export type DadosDoTema = z.output<typeof esquemaDoTema>;

export type CampoDeCor = keyof DadosDeCores;
export type ChaveDeVocabulario = keyof DadosDeVocabulario;

export const CAMPOS_DE_COR = esquemaDeCores.keyof().options;
export const CHAVES_DE_VOCABULARIO = esquemaDeVocabulario.keyof().options;
