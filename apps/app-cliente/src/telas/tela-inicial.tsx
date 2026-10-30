"use client";

import { Botao, CampoDeTexto, EscopoDeTema, Pagina } from "@marquei/ui";
import { paraVariaveisCss, temaPadraoDaVertical } from "@marquei/design-tokens";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CodigoDeAcesso } from "../apresentacao/codigo-de-acesso";
import { VocabularioDoEstabelecimento } from "../apresentacao/vocabulario-do-estabelecimento";
import { Mensagens } from "../mensagens/mensagens";

const mensagens = new Mensagens(VocabularioDoEstabelecimento.criar({}));
const variaveis = paraVariaveisCss(temaPadraoDaVertical("outro")).variaveis;

/** Entrada por código quando o cliente chegou sem link ou QR. */
export function TelaInicial() {
  const router = useRouter();
  const [codigo, definirCodigo] = useState("");
  const [erro, definirErro] = useState<string | null>(null);

  function abrir(evento: FormEvent): void {
    evento.preventDefault();
    const acesso = CodigoDeAcesso.criar(codigo);
    if (acesso === null) definirErro(mensagens.t("inicio.codigoInvalido"));
    else router.push(`/${acesso.valor}`);
  }

  return (
    <EscopoDeTema variaveis={variaveis}>
      <Pagina rotuloDePularParaOConteudo={mensagens.t("pagina.pularParaOConteudo")}>
        <form className="mq-secao" onSubmit={abrir} noValidate>
          <h1 className="mq-secao__titulo">{mensagens.t("inicio.titulo")}</h1>
          <p>{mensagens.t("inicio.descricao")}</p>
          <CampoDeTexto
            rotulo={mensagens.t("inicio.campoCodigo")}
            ajuda={mensagens.t("inicio.ajudaCodigo")}
            autoCapitalize="none"
            autoComplete="off"
            value={codigo}
            onChange={(e) => definirCodigo(e.target.value)}
            {...(erro ? { erro } : {})}
          />
          <Botao type="submit" larguraTotal>
            {mensagens.t("inicio.acaoAbrir")}
          </Botao>
        </form>
      </Pagina>
    </EscopoDeTema>
  );
}
