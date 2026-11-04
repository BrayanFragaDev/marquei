"use client";

import { SeletorDeHorario, type OpcaoDeHorario } from "@marquei/ui";
import type { HorariosLivres, Servico } from "../../api/gateway-da-api";
import { HorariosParaSelecao } from "../../apresentacao/horarios-para-selecao";
import type { SelecaoDeAgendamento } from "../../apresentacao/selecao-de-agendamento";
import { Carregavel } from "../../componentes/carregavel";
import { ListaDeServicos } from "../../componentes/lista-de-servicos";
import { useServicos } from "../../composicao/contexto-de-servicos";
import { useCarregamento, type EstadoDeCarregamento } from "../../ganchos/use-carregamento";
import { useCallback } from "react";

export function SecaoDeServico({
  servicos,
  selecao,
  aoEscolher,
}: {
  servicos: readonly Servico[];
  selecao: SelecaoDeAgendamento;
  aoEscolher: (servico: Servico) => void;
}) {
  const { mensagens } = useServicos();
  return (
    <section className="mq-secao" aria-labelledby="agendar-servico">
      <h2 className="mq-secao__titulo" id="agendar-servico">
        {mensagens.t("agendar.secaoServico")}
      </h2>
      <ListaDeServicos
        servicos={servicos}
        selecionadoId={selecao.servicoId}
        aoSelecionar={aoEscolher}
      />
    </section>
  );
}

export function SecaoDeProfissional({
  selecao,
  aoEscolher,
}: {
  selecao: SelecaoDeAgendamento;
  aoEscolher: (profissionalId: string | null) => void;
}) {
  const { mensagens, catalogoDeProfissionais } = useServicos();
  const { servicoId } = selecao;
  const carregar = useCallback(
    () => catalogoDeProfissionais.listar({ servicoId }),
    [catalogoDeProfissionais, servicoId],
  );
  const [estado, recarregar] = useCarregamento(carregar);
  return (
    <Carregavel estado={estado} aoTentarDeNovo={recarregar}>
      {(profissionais) => (
        <SeletorDeHorario
          legenda={mensagens.t("agendar.secaoProfissional")}
          opcoes={[
            { valor: "", rotulo: mensagens.t("agendar.qualquerProfissional") },
            ...profissionais.map((p) => ({ valor: p.id, rotulo: p.nome })),
          ]}
          valor={selecao.profissionalId ?? ""}
          aoSelecionar={(valor) => aoEscolher(valor === "" ? null : valor)}
          mensagemSemHorarios={mensagens.t("profissionais.vazio")}
        />
      )}
    </Carregavel>
  );
}

export function SecaoDeDia({
  dias,
  selecao,
  aoEscolher,
}: {
  dias: readonly string[];
  selecao: SelecaoDeAgendamento;
  aoEscolher: (dia: string) => void;
}) {
  const { mensagens, calendario } = useServicos();
  const opcoes: readonly OpcaoDeHorario[] = dias.map((d) => ({
    valor: d,
    rotulo: calendario.rotuloDoDia(d),
  }));
  return (
    <SeletorDeHorario
      legenda={mensagens.t("agendar.secaoDia")}
      opcoes={opcoes}
      valor={selecao.dia}
      aoSelecionar={aoEscolher}
      mensagemSemHorarios={mensagens.t("agendar.semNenhumDia")}
    />
  );
}

export function SecaoDeHorarios({
  horarios,
  selecao,
  aoTentarDeNovo,
  aoEscolher,
}: {
  horarios: EstadoDeCarregamento<HorariosLivres | null>;
  selecao: SelecaoDeAgendamento;
  aoTentarDeNovo: () => void;
  aoEscolher: (inicio: string, profissionalId: string) => void;
}) {
  const { mensagens, calendario } = useServicos();
  return (
    <Carregavel estado={horarios} aoTentarDeNovo={aoTentarDeNovo}>
      {(dados) => {
        const lista = new HorariosParaSelecao(dados?.itens ?? [], calendario);
        return (
          <SeletorDeHorario
            legenda={mensagens.t("agendar.secaoHorario")}
            opcoes={lista.opcoes()}
            valor={selecao.inicio}
            aoSelecionar={(inicio) => {
              const profissional = lista.profissionalDe(inicio);
              if (profissional !== null) aoEscolher(inicio, profissional);
            }}
            mensagemSemHorarios={mensagens.t("agendar.semHorarios")}
          />
        );
      }}
    </Carregavel>
  );
}
