"use client";

import { CartaoDeServico, ListaDeCartoes } from "@marquei/ui";
import { useRouter } from "next/navigation";
import { useCallback } from "react";
import { Carregavel } from "../componentes/carregavel";
import { useServicos } from "../composicao/contexto-de-servicos";
import { useCarregamento } from "../ganchos/use-carregamento";

export function TelaDeProfissionais() {
  const { mensagens, estabelecimento, catalogoDeProfissionais } = useServicos();
  const router = useRouter();
  const carregar = useCallback(
    () => catalogoDeProfissionais.listar({ servicoId: null }),
    [catalogoDeProfissionais],
  );
  const [estado, recarregar] = useCarregamento(carregar);
  const preset = estabelecimento.tema.cartaoDeServico;
  return (
    <section className="mq-secao">
      <h2 className="mq-secao__titulo">{mensagens.t("profissionais.titulo")}</h2>
      <Carregavel estado={estado} aoTentarDeNovo={recarregar}>
        {(profissionais) =>
          profissionais.length === 0 ? (
            <p className="mq-aviso">{mensagens.t("profissionais.vazio")}</p>
          ) : (
            <ListaDeCartoes preset={preset}>
              {profissionais.map((p) => (
                <CartaoDeServico
                  key={p.id}
                  nome={p.nome}

                  preset={preset}
                  rotuloDaAcao={mensagens.t("profissionais.acaoAgendar", { nome: p.nome })}
                  aoSelecionar={() =>
                    router.push(`/${estabelecimento.slug}/agendar?profissional=${p.id}`)
                  }
                />
              ))}
            </ListaDeCartoes>
          )
        }
      </Carregavel>
    </section>
  );
}
