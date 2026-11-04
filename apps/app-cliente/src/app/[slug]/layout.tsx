import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { carregarEstabelecimentoDoServidor } from "../../api/carregar-estabelecimento-do-servidor";
import { EstabelecimentoNaTela } from "../../apresentacao/estabelecimento-na-tela";
import { MoldeDoEstabelecimento } from "../../componentes/molde-do-estabelecimento";
import { ProvedorDeTema } from "../../componentes/provedor-de-tema";
import { RegistradorDoServiceWorker } from "../../componentes/registrador-do-service-worker";
import { ProvedorDeServicos } from "../../composicao/contexto-de-servicos";

interface Propriedades {
  readonly children: ReactNode;
  readonly params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: Pick<Propriedades, "params">): Promise<Metadata> {
  const { slug } = await params;
  const dados = await carregarEstabelecimentoDoServidor(slug);
  if (dados === null) return {};
  return {
    title: dados.nome,
    applicationName: dados.nome,
    manifest: `/${slug}/manifest.webmanifest`,
    icons: { icon: [{ url: `/${slug}/icone.svg`, type: "image/svg+xml" }] },
    appleWebApp: { capable: true, title: dados.nome, statusBarStyle: "default" },
  };
}

export async function generateViewport({
  params,
}: Pick<Propriedades, "params">): Promise<Viewport> {
  const { slug } = await params;
  const dados = await carregarEstabelecimentoDoServidor(slug);
  return dados === null
    ? {}
    : {
        themeColor: EstabelecimentoNaTela.criar(dados).corPrincipal,
        width: "device-width",
        initialScale: 1,
      };
}

export default async function LayoutDoEstabelecimento({ children, params }: Propriedades) {
  const { slug } = await params;
  const dados = await carregarEstabelecimentoDoServidor(slug);
  if (dados === null) notFound();
  return (
    <ProvedorDeServicos dados={dados}>
      <ProvedorDeTema dados={dados}>
        <MoldeDoEstabelecimento>{children}</MoldeDoEstabelecimento>
        <RegistradorDoServiceWorker />
      </ProvedorDeTema>
    </ProvedorDeServicos>
  );
}
