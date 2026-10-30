import { carregarEstabelecimentoDoServidor } from "../../../api/carregar-estabelecimento-do-servidor";
import { EstabelecimentoNaTela } from "../../../apresentacao/estabelecimento-na-tela";
import { montarManifesto } from "../../../apresentacao/manifesto-pwa";

export async function GET(_pedido: Request, contexto: { params: Promise<{ slug: string }> }) {
  const { slug } = await contexto.params;
  const dados = await carregarEstabelecimentoDoServidor(slug);
  if (dados === null) return new Response(null, { status: 404 });
  const manifesto = montarManifesto(EstabelecimentoNaTela.criar(dados));
  return new Response(JSON.stringify(manifesto), {
    headers: {
      "content-type": "application/manifest+json; charset=utf-8",
      "cache-control": "no-cache",
    },
  });
}
