"use client";

import { CabecalhoDoEstabelecimento, Pagina, classesDoBotao } from "@marquei/ui";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useServicos } from "../composicao/contexto-de-servicos";
import type { ChaveDeMensagem } from "../mensagens/catalogo-pt-br";
import { BotaoAdicionarATelaInicial } from "./botao-adicionar-a-tela-inicial";

const ITENS: readonly { caminho: string; chave: ChaveDeMensagem }[] = [
  { caminho: "", chave: "navegacao.inicio" },
  { caminho: "/servicos", chave: "navegacao.servicos" },
  { caminho: "/profissionais", chave: "navegacao.profissionais" },
  { caminho: "/agendar", chave: "navegacao.agendar" },
  { caminho: "/meus-agendamentos", chave: "navegacao.meusAgendamentos" },
  { caminho: "/entrar", chave: "navegacao.entrar" },
  { caminho: "/profissional", chave: "navegacao.modoProfissional" },
];

function Navegacao() {
  const { mensagens, estabelecimento } = useServicos();
  const atual = usePathname();
  return (
    <nav aria-label={mensagens.t("navegacao.rotulo")}>
      <ul className="mq-navegacao">
        {ITENS.map(({ caminho, chave }) => {
          const href = `/${estabelecimento.slug}${caminho}`;
          return (
            <li key={href}>
              <Link
                className={classesDoBotao("texto")}
                href={href}
                {...(atual === href ? { "aria-current": "page" as const } : {})}
              >
                {mensagens.t(chave)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

/** Moldura comum das telas do estabelecimento: marca, navegação e instalação do PWA. */
export function MoldeDoEstabelecimento({ children }: { children: ReactNode }) {
  const { mensagens, estabelecimento } = useServicos();
  return (
    <Pagina
      rotuloDePularParaOConteudo={mensagens.t("pagina.pularParaOConteudo")}
      cabecalho={
        <>
          <CabecalhoDoEstabelecimento
            nome={estabelecimento.nome}
            preset={estabelecimento.tema.cabecalho}
            descricao={estabelecimento.tema.textos.boasVindas}
            rotuloDoLogo={mensagens.t("marca.logoDe", { nome: estabelecimento.nome })}
          />
          <Navegacao />
        </>
      }
      rodape={<BotaoAdicionarATelaInicial />}
    >
      {children}
    </Pagina>
  );
}
