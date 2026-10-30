"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BuscadorDeHorarios } from "../../api/buscador-de-horarios";
import { useServicos } from "../../composicao/contexto-de-servicos";
import { useCarregamento } from "../../ganchos/use-carregamento";
import { SelecaoDeAgendamento } from "../../apresentacao/selecao-de-agendamento";

const DIAS_OFERECIDOS = 7;

/** Escolhas do fluxo + dias oferecidos + busca do primeiro dia livre. Só orquestra chamadas. */
export function useFluxoDeAgendamento(inicial: SelecaoDeAgendamento) {
  const { gatewayDoCliente, calendario, agora } = useServicos();
  const [selecao, definirSelecao] = useState(inicial);
  const [semNenhumDia, definirSemNenhumDia] = useState(false);
  const dias = useMemo(
    () => calendario.proximosDias(agora(), DIAS_OFERECIDOS),
    [calendario, agora],
  );
  const { servicoId, profissionalId, dia } = selecao;

  useEffect(() => {
    if (servicoId === null || dia !== null) return;
    let ativo = true;
    new BuscadorDeHorarios(gatewayDoCliente)
      .primeiroDiaComHorarios({ servicoId, profissionalId, dias })
      .then((achado) => {
        if (!ativo) return;
        definirSemNenhumDia(achado === null);
        if (achado !== null) definirSelecao((atual) => atual.comDia(achado));
      })
      .catch(() => ativo && definirSemNenhumDia(true));
    return () => {
      ativo = false;
    };
  }, [gatewayDoCliente, servicoId, profissionalId, dia, dias]);

  const carregarHorarios = useCallback(
    () =>
      servicoId !== null && dia !== null
        ? gatewayDoCliente.listarHorariosLivres({ servicoId, profissionalId, data: dia })
        : Promise.resolve(null),
    [gatewayDoCliente, servicoId, profissionalId, dia],
  );
  const [horarios, recarregarHorarios] = useCarregamento(carregarHorarios);
  return { selecao, definirSelecao, dias, semNenhumDia, horarios, recarregarHorarios };
}
