import type { EstabelecimentoNaTela } from "./estabelecimento-na-tela";

export interface ManifestoPwa {
  readonly name: string;
  readonly short_name: string;
  readonly description: string;
  readonly lang: string;
  readonly start_url: string;
  readonly scope: string;
  readonly id: string;
  readonly display: "standalone";
  readonly orientation: "portrait";
  readonly theme_color: string;
  readonly background_color: string;
  readonly icons: readonly { src: string; sizes: string; type: string; purpose: string }[];
}

const NOME_CURTO_MAXIMO = 12;

/** Manifesto do PWA com a marca do estabelecimento (nome, cores e ícones vêm do tema). */
export function montarManifesto(estabelecimento: EstabelecimentoNaTela): ManifestoPwa {
  const base = `/${estabelecimento.slug}`;
  const icone = `${base}/icone.svg`;
  return {
    name: estabelecimento.nome,
    short_name: estabelecimento.nome.slice(0, NOME_CURTO_MAXIMO),
    description: estabelecimento.tema.textos.boasVindas,
    lang: "pt-BR",
    id: base,
    start_url: `${base}?origem=pwa`,
    scope: `${base}/`,
    display: "standalone",
    orientation: "portrait",
    theme_color: estabelecimento.corPrincipal,
    background_color: estabelecimento.corDeFundo,
    icons: [
      { src: icone, sizes: "any", type: "image/svg+xml", purpose: "any" },
      { src: icone, sizes: "512x512", type: "image/svg+xml", purpose: "maskable" },
    ],
  };
}

/** Ícone SVG: monograma do nome sobre a cor principal, texto na cor de contraste do tema. */
export function montarIconeSvg(estabelecimento: EstabelecimentoNaTela): string {
  const inicial = escaparXml(estabelecimento.nome.trim().charAt(0).toLocaleUpperCase("pt-BR"));
  const fundo = estabelecimento.corPrincipal;
  const letra = estabelecimento.tema.cores.obter("textoSobrePrimaria").valor;
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img">',
    `<rect width="512" height="512" fill="${fundo}"/>`,
    `<text x="256" y="256" fill="${letra}" font-family="sans-serif" font-size="280" font-weight="700" text-anchor="middle" dominant-baseline="central">${inicial}</text>`,
    "</svg>",
  ].join("");
}

function escaparXml(texto: string): string {
  return texto.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}
