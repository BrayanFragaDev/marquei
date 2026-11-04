import {
  IDS_DE_CABECALHO,
  IDS_DE_CARTAO_DE_SERVICO,
  IDS_DE_DENSIDADE,
  IDS_DE_FAMILIA,
  IDS_DE_RAIO,
  type IdDeCabecalho,
  type IdDeCartaoDeServico,
  type IdDeDensidade,
  type IdDeFamilia,
  type IdDeRaio,
} from "@marquei/design-tokens";

/** Estreitam um texto vindo da interface para o id curado correspondente (ou `undefined`). */
export const familiaCurada = (id: string): IdDeFamilia | undefined =>
  IDS_DE_FAMILIA.find((i) => i === id);
export const raioCurado = (id: string): IdDeRaio | undefined => IDS_DE_RAIO.find((i) => i === id);
export const densidadeCurada = (id: string): IdDeDensidade | undefined =>
  IDS_DE_DENSIDADE.find((i) => i === id);
export const cabecalhoCurado = (id: string): IdDeCabecalho | undefined =>
  IDS_DE_CABECALHO.find((i) => i === id);
export const cartaoCurado = (id: string): IdDeCartaoDeServico | undefined =>
  IDS_DE_CARTAO_DE_SERVICO.find((i) => i === id);
