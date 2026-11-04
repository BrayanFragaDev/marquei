import { mensagens } from "../i18n/mensagens-pt-br";
import type { ItemDoMenu } from "../componentes/menu-principal";
import { ROTA_DA_SECAO, type PermissoesDoPapel, type SecaoDoConsole } from "../sessao/permissoes-do-papel";
import type { Linguagem } from "../i18n/linguagem";

const ROTULO_DA_SECAO: Readonly<Record<SecaoDoConsole, string>> = {
  painel: mensagens.menu.painel,
  servicos: mensagens.menu.servicos,
  equipe: mensagens.menu.equipe,
  horarios: mensagens.menu.horarios,
  agendamentos: mensagens.menu.agendamentos,
  tema: mensagens.menu.tema,
};

/** Itens do menu para o papel (profissional enxerga so "Minha agenda"). */
export function itensDoMenu(permissoes: PermissoesDoPapel, linguagem: Linguagem): ItemDoMenu[] {
  return permissoes.secoesVisiveis().map((secao) => ({
    rota: ROTA_DA_SECAO[secao],
    rotulo: linguagem.aplicar(
      permissoes.soPropriaAgenda() && secao === "agendamentos"
        ? mensagens.menu.agendaPropria
        : ROTULO_DA_SECAO[secao],
    ),
  }));
}
