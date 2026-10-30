"use client";

import { classesDoBotao } from "@marquei/ui";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Carregavel } from "../componentes/carregavel";
import { ListaDeServicos } from "../componentes/lista-de-servicos";
import { useServicos } from "../composicao/contexto-de-servicos";
import { useServicosDoCatalogo } from "../ganchos/use-catalogo";

/** Vitrine: serviços em destaque e um toque para começar a agendar. */
export function TelaVitrine() {
  const { mensagens, estabelecimento } = useServicos();
  const router = useRouter();
  const [estado, recarregar] = useServicosDoCatalogo();
  const base = `/${estabelecimento.slug}`;
  return (
    <section className="mq-secao">
      <h2 className="mq-secao__titulo">{mensagens.t("vitrine.escolhaServico")}</h2>
      <Carregavel estado={estado} aoTentarDeNovo={recarregar}>
        {(servicos) => (
          <ListaDeServicos
            servicos={servicos}
            aoSelecionar={(s) => router.push(`${base}/agendar?servico=${s.id}`)}
          />
        )}
      </Carregavel>
      <Link className={classesDoBotao("secundario", true)} href={`${base}/servicos`}>
        {mensagens.t("vitrine.verTodos")}
      </Link>
      <Link className={classesDoBotao("texto", true)} href={`${base}/profissionais`}>
        {mensagens.t("vitrine.verProfissionais")}
      </Link>
    </section>
  );
}
