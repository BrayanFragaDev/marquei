"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import type { Agendamento, Servico } from "../../api/gateway-da-api";
import { SelecaoDeAgendamento } from "../../apresentacao/selecao-de-agendamento";
import { Carregavel } from "../../componentes/carregavel";
import { useServicos } from "../../composicao/contexto-de-servicos";
import { useServicosDoCatalogo } from "../../ganchos/use-catalogo";
import { Confirmado, ResumoEConfirmacao } from "./confirmacao";
import { SecaoDeDia, SecaoDeHorarios, SecaoDeProfissional, SecaoDeServico } from "./secoes";
import { useFluxoDeAgendamento } from "./use-agendamento";

type Fluxo = ReturnType<typeof useFluxoDeAgendamento>;

function PassosDoServico({
  fluxo,
  servico,
  aoConfirmar,
}: {
  fluxo: Fluxo;
  servico: Servico;
  aoConfirmar: (agendamento: Agendamento) => void;
}) {
  const { selecao, definirSelecao } = fluxo;
  return (
    <>
      <SecaoDeProfissional
        selecao={selecao}
        aoEscolher={(id) => definirSelecao(selecao.comProfissional(id))}
      />
      <SecaoDeDia
        dias={fluxo.dias}
        selecao={selecao}
        aoEscolher={(dia) => definirSelecao(selecao.comDia(dia))}
      />
      <SecaoDeHorarios
        horarios={fluxo.horarios}
        selecao={selecao}
        aoTentarDeNovo={fluxo.recarregarHorarios}
        aoEscolher={(inicio, prof) => definirSelecao(selecao.comHorario(inicio, prof))}
      />
      <ResumoEConfirmacao
        selecao={selecao}
        servico={servico}
        aoConfirmar={aoConfirmar}
        aoConflito={fluxo.recarregarHorarios}
      />
    </>
  );
}

function Passos({ servicos, fluxo }: { servicos: readonly Servico[]; fluxo: Fluxo }) {
  const [confirmado, definirConfirmado] = useState<Agendamento | null>(null);
  const { selecao, definirSelecao } = fluxo;
  const servico = servicos.find((s) => s.id === selecao.servicoId) ?? null;
  if (confirmado && servico) return <Confirmado agendamento={confirmado} servico={servico} />;
  return (
    <>
      <SecaoDeServico
        servicos={servicos}
        selecao={selecao}
        aoEscolher={(s) => definirSelecao(selecao.comServico(s.id))}
      />
      {servico ? (
        <PassosDoServico fluxo={fluxo} servico={servico} aoConfirmar={definirConfirmado} />
      ) : null}
    </>
  );
}

/** Serviço -> profissional -> dia -> horário -> confirmar, na mesma tela, com padrões úteis. */
export function TelaAgendar() {
  const { mensagens } = useServicos();
  const [catalogo, recarregarCatalogo] = useServicosDoCatalogo();
  const fluxo = useFluxoDeAgendamento(SelecaoDeAgendamento.deConsulta(useSearchParams()));
  return (
    <>
      <h2 className="mq-secao__titulo">{mensagens.t("agendar.titulo")}</h2>
      <Carregavel estado={catalogo} aoTentarDeNovo={recarregarCatalogo}>
        {(servicos) => <Passos servicos={servicos} fluxo={fluxo} />}
      </Carregavel>
    </>
  );
}
