import type { DadosDeCores } from "../esquema/esquema-do-tema";
import type { EscalaDeEspacamento } from "../opcoes/densidades";
import type { IdDeCabecalho, IdDeCartaoDeServico } from "../opcoes/presets";
import type { EscalaDeRaio } from "../opcoes/raios";
import type { TemaDoEstabelecimento } from "../tema/tema-do-estabelecimento";

/** Tema para React Native: so dados (numeros em dp/px, cores hex, nomes). */
export interface TemaNativo {
  readonly cores: Readonly<DadosDeCores>;
  readonly raios: EscalaDeRaio;
  readonly espacamentos: EscalaDeEspacamento;
  readonly fonte: { readonly familia: string; readonly alternativa: string };
  readonly presets: {
    readonly cabecalho: IdDeCabecalho;
    readonly cartaoDeServico: IdDeCartaoDeServico;
  };
}

/** Gera o tema nativo. Mesmos valores de `paraVariaveisCss`. */
export function paraTemaNativo(tema: TemaDoEstabelecimento): TemaNativo {
  return {
    cores: tema.cores.paraDados(),
    raios: { ...tema.escalaDeRaio() },
    espacamentos: { ...tema.escalaDeEspacamento() },
    fonte: tema.familia.fonteNativa(),
    presets: { cabecalho: tema.cabecalho, cartaoDeServico: tema.cartaoDeServico },
  };
}
