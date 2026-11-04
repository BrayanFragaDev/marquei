"use client";

import { Botao, CampoDeTexto } from "@marquei/ui";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CODIGO_DE_TESTE } from "../adaptadores/autenticador-simulado";
import { destinoSeguro } from "../apresentacao/destino-seguro";
import { useServicos } from "../composicao/contexto-de-servicos";
import { FalhaDeLoginDoCliente } from "../portas/autenticador-do-cliente";

type Etapa = "telefone" | "codigo";

function useLoginDoCliente() {
  const { mensagens, autenticador, estabelecimento } = useServicos();
  const router = useRouter();
  const destino = destinoSeguro(estabelecimento.slug, useSearchParams().get("voltar"));
  const [etapa, definirEtapa] = useState<Etapa>("telefone");
  const [telefone, definirTelefone] = useState("");
  const [codigo, definirCodigo] = useState("");
  const [erro, definirErro] = useState<string | null>(null);

  async function enviar(evento: FormEvent): Promise<void> {
    evento.preventDefault();
    definirErro(null);
    const { slug } = estabelecimento;
    try {
      if (etapa === "telefone") {
        await autenticador.solicitarCodigo({ slug, telefone });
        definirEtapa("codigo");
      } else {
        await autenticador.confirmarCodigo({ slug, telefone, codigo });
        router.replace(destino);
      }
    } catch (falha) {
      definirErro(
        mensagens.paraErro(falha instanceof FalhaDeLoginDoCliente ? falha.codigo : "generico"),
      );
    }
  }
  return { etapa, definirEtapa, telefone, definirTelefone, codigo, definirCodigo, erro, enviar };
}

type Login = ReturnType<typeof useLoginDoCliente>;

function EtapaDoTelefone({ login }: { login: Login }) {
  const { mensagens } = useServicos();
  return (
    <>
      <p>{mensagens.t("entrar.descricaoTelefone")}</p>
      <CampoDeTexto
        rotulo={mensagens.t("entrar.campoTelefone")}
        type="tel"
        inputMode="numeric"
        autoComplete="tel-national"
        value={login.telefone}
        onChange={(e) => login.definirTelefone(e.target.value)}
        {...(login.erro ? { erro: login.erro } : {})}
      />
      <Botao type="submit" larguraTotal>
        {mensagens.t("entrar.acaoEnviarCodigo")}
      </Botao>
    </>
  );
}

function EtapaDoCodigo({ login }: { login: Login }) {
  const { mensagens } = useServicos();
  return (
    <>
      <p>{mensagens.t("entrar.descricaoCodigo", { telefone: login.telefone })}</p>
      <p className="mq-aviso">{mensagens.t("entrar.avisoSimulado", { codigo: CODIGO_DE_TESTE })}</p>
      <CampoDeTexto
        rotulo={mensagens.t("entrar.campoCodigo")}
        inputMode="numeric"
        autoComplete="one-time-code"
        maxLength={6}
        value={login.codigo}
        onChange={(e) => login.definirCodigo(e.target.value)}
        {...(login.erro ? { erro: login.erro } : {})}
      />
      <Botao type="submit" larguraTotal>
        {mensagens.t("entrar.acaoConfirmarCodigo")}
      </Botao>
      <Botao variante="texto" onClick={() => login.definirEtapa("telefone")}>
        {mensagens.t("entrar.acaoTrocarTelefone")}
      </Botao>
    </>
  );
}

/** Login do cliente por celular + código (OTP). Hoje usa o adaptador simulado (pendência AS). */
export function TelaEntrar() {
  const { mensagens } = useServicos();
  const login = useLoginDoCliente();
  return (
    <form className="mq-secao" onSubmit={(e) => void login.enviar(e)} noValidate>
      <h2 className="mq-secao__titulo">{mensagens.t("entrar.titulo")}</h2>
      {login.etapa === "telefone" ? (
        <EtapaDoTelefone login={login} />
      ) : (
        <EtapaDoCodigo login={login} />
      )}
    </form>
  );
}
