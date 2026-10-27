import { ParDeContraste } from "./par-de-contraste";
import { RequisitoDeContraste } from "./requisito-de-contraste";

const { TEXTO_NORMAL, TEXTO_GRANDE_OU_COMPONENTE } = RequisitoDeContraste;

/** Pares que todo tema publicado precisa atender (WCAG AA). */
export const PARES_PADRAO: readonly ParDeContraste[] = [
  new ParDeContraste("texto", "fundo", TEXTO_NORMAL, "texto"),
  new ParDeContraste("texto", "superficie", TEXTO_NORMAL, "texto"),
  new ParDeContraste("textoSuave", "fundo", TEXTO_NORMAL, "textoSuave"),
  new ParDeContraste("textoSuave", "superficie", TEXTO_NORMAL, "textoSuave"),
  new ParDeContraste("textoSobrePrimaria", "primaria", TEXTO_NORMAL, "textoSobrePrimaria"),
  new ParDeContraste("texto", "apoio", TEXTO_NORMAL, "texto"),
  new ParDeContraste("primaria", "fundo", TEXTO_GRANDE_OU_COMPONENTE, "primaria"),
  new ParDeContraste("primaria", "superficie", TEXTO_GRANDE_OU_COMPONENTE, "primaria"),
];
