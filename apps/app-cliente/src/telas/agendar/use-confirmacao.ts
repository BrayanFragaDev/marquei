"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Agendamento } from "../../api/gateway-da-api";
import { ErroDaApi } from "../../api/erro-da-api";
import type { SelecaoDeAgendamento } from "../../apresentacao/selecao-de-agendamento";
import { useServicos } from "../../composicao/contexto-de-servicos";
import type { SessaoDoCliente } from "../../portas/autenticador-do-cliente";

interface Entrada {
  readonly selecao: SelecaoDeAgendamento;
  readonly sessao: SessaoDoCliente | null;
  readonly aoConfirmar: (agendamento: Agendamento) => void;
  readonly aoConflito: () => void;
}

/** Envia o agendamento (ou desvia para o login) e traduz a falha da API em mensagem. */
export function useConfirmacao({ selecao, sessao, aoConfirmar, aoConflito }: Entrada) {
  const s = useServicos();
  const router = useRouter();
  const [enviando, definirEnviando] = useState(false);
  const [erro, definirErro] = useState<string | null>(null);
  const { slug } = s.estabelecimento;

  async function enviar(): Promise<void> {
    const { servicoId, inicio, profissionalDoHorario } = selecao;
    if (servicoId === null || inicio === null || profissionalDoHorario === null) return;
    definirEnviando(true);
    definirErro(null);
    try {
      const criado = await s.gatewayDoCliente.criarAgendamento({
        servicoId,
        profissionalId: profissionalDoHorario,
        inicio,
      });
      s.agendamentosDoCliente.registrar(slug, criado);
      aoConfirmar(criado);
    } catch (falha) {
      const codigo = falha instanceof ErroDaApi ? falha.codigo : "erro_desconhecido";
      definirErro(s.mensagens.paraErro(codigo));
      if (codigo === "horario_indisponivel") aoConflito();
    } finally {
      definirEnviando(false);
    }
  }

  function confirmar(): void {
    if (sessao !== null) {
      void enviar();
      return;
    }
    const volta = `/${slug}/agendar?${selecao.paraConsulta().toString()}`;
    router.push(`/${slug}/entrar?voltar=${encodeURIComponent(volta)}`);
  }

  return { confirmar, enviando, erro };
}
