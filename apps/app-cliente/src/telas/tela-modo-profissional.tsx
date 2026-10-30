"use client";

import { Botao, CampoDeTexto } from "@marquei/ui";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { ErroDaApi } from "../api/erro-da-api";
import { CHAVE_DO_STATUS } from "../apresentacao/status-do-agendamento";
import { Carregavel } from "../componentes/carregavel";
import { useServicos } from "../composicao/contexto-de-servicos";
import { useCarregamento } from "../ganchos/use-carregamento";
import type { ItemDaAgenda } from "../portas/agenda-do-profissional";

function useLoginDoProfissional(aoEntrar: () => void) {
  const { mensagens, gatewayDoProfissional, sessaoDoProfissional, estabelecimento } = useServicos();
  const [email, definirEmail] = useState("");
  const [senha, definirSenha] = useState("");
  const [erro, definirErro] = useState<string | null>(null);

  async function enviar(evento: FormEvent): Promise<void> {
    evento.preventDefault();
    definirErro(null);
    try {
      const sessao = await gatewayDoProfissional.entrar({
        estabelecimento: estabelecimento.slug,
        email,
        senha,
      });
      sessaoDoProfissional.gravar(estabelecimento.slug, {
        token: sessao.token,
        papel: sessao.papel,
      });
      aoEntrar();
    } catch (falha) {
      definirErro(mensagens.paraErro(falha instanceof ErroDaApi ? falha.codigo : "generico"));
    }
  }
  return { email, definirEmail, senha, definirSenha, erro, enviar };
}

function FormularioDeEntrada({ aoEntrar }: { aoEntrar: () => void }) {
  const { mensagens } = useServicos();
  const login = useLoginDoProfissional(aoEntrar);
  return (
    <form className="mq-secao" onSubmit={(e) => void login.enviar(e)} noValidate>
      <p>{mensagens.t("profissional.descricaoEntrar")}</p>
      <CampoDeTexto
        rotulo={mensagens.t("profissional.campoEmail")}
        type="email"
        autoComplete="username"
        value={login.email}
        onChange={(e) => login.definirEmail(e.target.value)}
      />
      <CampoDeTexto
        rotulo={mensagens.t("profissional.campoSenha")}
        type="password"
        autoComplete="current-password"
        value={login.senha}
        onChange={(e) => login.definirSenha(e.target.value)}
        {...(login.erro ? { erro: login.erro } : {})}
      />
      <Botao type="submit" larguraTotal>
        {mensagens.t("profissional.acaoEntrar")}
      </Botao>
    </form>
  );
}

function Atendimento({
  item,
  aoConcluir,
}: {
  item: ItemDaAgenda;
  aoConcluir: (id: string) => void;
}) {
  const { mensagens, calendario } = useServicos();
  const hora = calendario.hora(item.inicio);
  return (
    <li className="mq-cartao">
      <span>
        <span className="mq-cartao__nome">{item.nomeDoServico}</span>
        <span className="mq-cartao__detalhe">
          {hora} · {mensagens.t(CHAVE_DO_STATUS[item.status])}
        </span>
      </span>
      {item.status === "confirmado" ? (
        <Botao
          aria-label={mensagens.t("profissional.acaoConcluirDe", {
            nome: item.nomeDoServico,
            hora,
          })}
          onClick={() => aoConcluir(item.id)}
        >
          {mensagens.t("profissional.acaoConcluir")}
        </Botao>
      ) : null}
    </li>
  );
}

function AgendaDoDia({ aoSair }: { aoSair: () => void }) {
  const { mensagens, calendario, agora, agendaDoProfissional } = useServicos();
  const dia = calendario.diaCivil(agora().toISOString());
  const carregar = useCallback(() => agendaDoProfissional.doDia(dia), [agendaDoProfissional, dia]);
  const [estado, recarregar] = useCarregamento(carregar);
  const [concluidos, definirConcluidos] = useState<readonly ItemDaAgenda[]>([]);
  const concluir = async (id: string): Promise<void> => {
    const item = await agendaDoProfissional.concluir(id);
    definirConcluidos((atuais) => [...atuais.filter((a) => a.id !== id), item]);
  };
  return (
    <section className="mq-secao">
      <h2 className="mq-secao__titulo">{mensagens.t("profissional.agendaDoDia")}</h2>
      <p className="mq-aviso">{mensagens.t("profissional.avisoSimulado")}</p>
      <Carregavel estado={estado} aoTentarDeNovo={recarregar}>
        {(itens) => (
          <ul className="mq-lista-cartoes">
            {itens.map((original) => (
              <Atendimento
                key={original.id}
                item={concluidos.find((c) => c.id === original.id) ?? original}
                aoConcluir={(id) => void concluir(id)}
              />
            ))}
          </ul>
        )}
      </Carregavel>
      <Botao variante="texto" onClick={aoSair}>
        {mensagens.t("entrar.sair")}
      </Botao>
    </section>
  );
}

/** Modo profissional: login por e-mail e senha e agenda do dia (simulada até a API expor a agenda). */
export function TelaModoProfissional() {
  const { mensagens, sessaoDoProfissional, estabelecimento } = useServicos();
  const [logado, definirLogado] = useState<boolean | null>(null);
  useEffect(() => {
    definirLogado(sessaoDoProfissional.ler(estabelecimento.slug) !== null);
  }, [sessaoDoProfissional, estabelecimento.slug]);
  const sair = (): void => {
    sessaoDoProfissional.sair(estabelecimento.slug);
    definirLogado(false);
  };
  return (
    <section className="mq-secao">
      <h2 className="mq-secao__titulo">{mensagens.t("profissional.titulo")}</h2>
      {logado === null ? null : logado ? (
        <AgendaDoDia aoSair={sair} />
      ) : (
        <FormularioDeEntrada aoEntrar={() => definirLogado(true)} />
      )}
    </section>
  );
}
