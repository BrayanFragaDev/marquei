"use client";

import { Botao, classesDoBotao } from "@marquei/ui";
import Link from "next/link";
import type { Agendamento, Servico } from "../../api/gateway-da-api";
import { formatarPreco } from "../../apresentacao/formatadores";
import type { SelecaoDeAgendamento } from "../../apresentacao/selecao-de-agendamento";
import { useServicos } from "../../composicao/contexto-de-servicos";
import { useSessaoDoCliente } from "../../ganchos/use-sessao-do-cliente";
import { useConfirmacao } from "./use-confirmacao";

export function ResumoEConfirmacao(props: {
  selecao: SelecaoDeAgendamento;
  servico: Servico;
  aoConfirmar: (agendamento: Agendamento) => void;
  aoConflito: () => void;
}) {
  const { selecao, servico } = props;
  const s = useServicos();
  const { pronto, sessao } = useSessaoDoCliente();
  const { confirmar, enviando, erro } = useConfirmacao({ ...props, sessao });
  if (selecao.inicio === null) return null;
  const resumo = s.mensagens.t("agendar.resumo", {
    servico: servico.nome,
    dia: s.calendario.rotuloDoDia(s.calendario.diaCivil(selecao.inicio)),
    hora: s.calendario.hora(selecao.inicio),
    preco: formatarPreco(servico.precoCentavos),
  });
  const rotulo = !pronto || sessao !== null ? "agendar.confirmar" : "agendar.entrarParaConfirmar";
  return (
    <section className="mq-secao" aria-live="polite">
      <p>{resumo}</p>
      {erro ? (
        <p role="alert" className="mq-aviso">
          {erro}
        </p>
      ) : null}
      <Botao larguraTotal disabled={enviando || !pronto} onClick={confirmar}>
        {enviando ? s.mensagens.t("agendar.confirmando") : s.mensagens.t(rotulo)}
      </Botao>
    </section>
  );
}

export function Confirmado({
  agendamento,
  servico,
}: {
  agendamento: Agendamento;
  servico: Servico;
}) {
  const { mensagens, estabelecimento, calendario } = useServicos();
  return (
    <section className="mq-secao" role="status">
      <h2 className="mq-secao__titulo">{mensagens.t("agendar.confirmadoTitulo")}</h2>
      <p>{estabelecimento.tema.textos.confirmacao}</p>
      <p>
        {servico.nome} · {calendario.rotuloDoDia(calendario.diaCivil(agendamento.inicio))} ·{" "}
        {calendario.hora(agendamento.inicio)}
      </p>
      <Link
        className={classesDoBotao("secundario", true)}
        href={`/${estabelecimento.slug}/meus-agendamentos`}
      >
        {mensagens.t("agendar.verMeusAgendamentos")}
      </Link>
    </section>
  );
}
