"use client";

import { Botao, classesDoBotao } from "@marquei/ui";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ErroDaApi } from "../api/erro-da-api";
import type { Agendamento, Servico } from "../api/gateway-da-api";
import { formatarPreco } from "../apresentacao/formatadores";
import { CHAVE_DO_STATUS } from "../apresentacao/status-do-agendamento";
import { Carregavel } from "../componentes/carregavel";
import { useServicos } from "../composicao/contexto-de-servicos";
import { useServicosDoCatalogo } from "../ganchos/use-catalogo";
import { useSessaoDoCliente } from "../ganchos/use-sessao-do-cliente";

function Item({
  agendamento,
  servico,
  aoCancelar,
}: {
  agendamento: Agendamento;
  servico: Servico | undefined;
  aoCancelar: (id: string) => void;
}) {
  const { mensagens, calendario } = useServicos();
  const dia = calendario.rotuloDoDia(calendario.diaCivil(agendamento.inicio));
  const hora = calendario.hora(agendamento.inicio);
  const nome = servico?.nome ?? "";
  const detalhes = [
    dia,
    hora,
    mensagens.t(CHAVE_DO_STATUS[agendamento.status]),
    formatarPreco(agendamento.precoCentavos),
  ];
  return (
    <li className="mq-cartao">
      <span>
        <span className="mq-cartao__nome">{nome}</span>
        <span className="mq-cartao__detalhe">{detalhes.join(" · ")}</span>
      </span>
      {agendamento.status === "confirmado" ? (
        <Botao
          variante="secundario"
          aria-label={mensagens.t("meus.acaoCancelarDe", { nome, dia, hora })}
          onClick={() => aoCancelar(agendamento.id)}
        >
          {mensagens.t("meus.acaoCancelar")}
        </Botao>
      ) : null}
    </li>
  );
}

/** Cancela no servidor (que aplica a política do estabelecimento) e guarda o resultado. */
function useCancelamento() {
  const s = useServicos();
  const { slug } = s.estabelecimento;
  const [itens, definirItens] = useState<readonly Agendamento[]>([]);
  const [aviso, definirAviso] = useState<string | null>(null);
  useEffect(
    () => definirItens(s.agendamentosDoCliente.listar(slug)),
    [s.agendamentosDoCliente, slug],
  );

  const cancelar = useCallback(
    async (id: string): Promise<void> => {
      definirAviso(null);
      try {
        const cancelado = await s.gatewayDoCliente.cancelarAgendamento(id);
        s.agendamentosDoCliente.atualizar(slug, cancelado);
        definirItens(s.agendamentosDoCliente.listar(slug));
        definirAviso(s.mensagens.t("meus.cancelado"));
      } catch (falha) {
        definirAviso(s.mensagens.paraErro(falha instanceof ErroDaApi ? falha.codigo : "generico"));
      }
    },
    [s, slug],
  );
  return { itens, aviso, cancelar };
}

function PrecisaEntrar() {
  const { mensagens, estabelecimento } = useServicos();
  const { slug } = estabelecimento;
  const volta = encodeURIComponent(`/${slug}/meus-agendamentos`);
  return (
    <section className="mq-secao">
      <p>{mensagens.t("meus.precisaEntrar")}</p>
      <Link className={classesDoBotao("primario", true)} href={`/${slug}/entrar?voltar=${volta}`}>
        {mensagens.t("navegacao.entrar")}
      </Link>
    </section>
  );
}

export function TelaMeusAgendamentos() {
  const { mensagens } = useServicos();
  const { pronto, sessao } = useSessaoDoCliente();
  const [catalogo, recarregarCatalogo] = useServicosDoCatalogo();
  const { itens, aviso, cancelar } = useCancelamento();
  if (pronto && sessao === null) return <PrecisaEntrar />;
  return (
    <section className="mq-secao">
      <h2 className="mq-secao__titulo">{mensagens.t("meus.titulo")}</h2>
      {aviso ? (
        <p role="status" className="mq-aviso">
          {aviso}
        </p>
      ) : null}
      <Carregavel estado={catalogo} aoTentarDeNovo={recarregarCatalogo}>
        {(servicos) =>
          itens.length === 0 ? (
            <p>{mensagens.t("meus.vazio")}</p>
          ) : (
            <ul className="mq-lista-cartoes">
              {itens.map((a) => (
                <Item
                  key={a.id}
                  agendamento={a}
                  servico={servicos.find((x) => x.id === a.servicoId)}
                  aoCancelar={(id) => void cancelar(id)}
                />
              ))}
            </ul>
          )
        }
      </Carregavel>
    </section>
  );
}
