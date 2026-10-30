"use client";

import { CartaoDeServico, ListaDeCartoes } from "@marquei/ui";
import type { Servico } from "../api/gateway-da-api";
import { formatarPreco } from "../apresentacao/formatadores";
import { useServicos } from "../composicao/contexto-de-servicos";

export function ListaDeServicos({
  servicos,
  selecionadoId = null,
  aoSelecionar,
}: {
  servicos: readonly Servico[];
  selecionadoId?: string | null;
  aoSelecionar: (servico: Servico) => void;
}) {
  const { estabelecimento, mensagens, duracoes } = useServicos();
  const preset = estabelecimento.tema.cartaoDeServico;
  return (
    <ListaDeCartoes preset={preset}>
      {servicos.map((servico) => (
        <CartaoDeServico
          key={servico.id}
          nome={servico.nome}
          duracao={duracoes.formatar(servico.duracaoMinutos)}
          preco={formatarPreco(servico.precoCentavos)}
          preset={preset}
          selecionado={servico.id === selecionadoId}
          rotuloDeSelecionado={mensagens.t("agendar.selecionado")}
          rotuloDaAcao={mensagens.t("vitrine.acaoAgendar", { nome: servico.nome })}
          aoSelecionar={() => aoSelecionar(servico)}
        />
      ))}
    </ListaDeCartoes>
  );
}
