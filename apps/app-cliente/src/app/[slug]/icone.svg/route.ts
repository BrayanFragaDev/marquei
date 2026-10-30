import { carregarEstabelecimentoDoServidor } from "../../../api/carregar-estabelecimento-do-servidor";
import { EstabelecimentoNaTela } from "../../../apresentacao/estabelecimento-na-tela";
import { montarIconeSvg } from "../../../apresentacao/manifesto-pwa";

export async function GET(_pedido: Request, contexto: { params: Promise<{ slug: string }> }) {
  const { slug } = await contexto.params;
  const dados = await carregarEstabelecimentoDoServidor(slug);
  if (dados === null) return new Response(null, { status: 404 });
  return new Response(montarIconeSvg(EstabelecimentoNaTela.criar(dados)), {
    headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "no-cache" },
  });
}
