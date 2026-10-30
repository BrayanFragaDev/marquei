"use client";

import { useRouter } from "next/navigation";
import { Carregavel } from "../componentes/carregavel";
import { ListaDeServicos } from "../componentes/lista-de-servicos";
import { useServicos } from "../composicao/contexto-de-servicos";
import { useServicosDoCatalogo } from "../ganchos/use-catalogo";

/** Catálogo completo; tocar num item já abre o agendamento com ele escolhido. */
export function TelaDeServicos() {
  const { mensagens, estabelecimento } = useServicos();
  const router = useRouter();
  const [estado, recarregar] = useServicosDoCatalogo();
  return (
    <section className="mq-secao">
      <h2 className="mq-secao__titulo">{mensagens.t("servicos.titulo")}</h2>
      <Carregavel estado={estado} aoTentarDeNovo={recarregar}>
        {(servicos) => (
          <ListaDeServicos
            servicos={servicos}
            aoSelecionar={(s) => router.push(`/${estabelecimento.slug}/agendar?servico=${s.id}`)}
          />
        )}
      </Carregavel>
    </section>
  );
}
