"use client";

import { useMemo, useState, useTransition } from "react";
import { CAMPOS_DE_COR, type DadosDoTema } from "@marquei/design-tokens";
import { EditorDeTema } from "../../aplicacao/editor-de-tema";
import {
  cabecalhoCurado,
  cartaoCurado,
  densidadeCurada,
  familiaCurada,
  raioCurado,
} from "../../aplicacao/ids-de-opcao";
import type {
  MotivoDeRecusaDoTema,
  OpcoesDeTema,
  OrigemDoTema,
  ResultadoDaAcaoDeTema,
} from "../../aplicacao/servico-de-tema";
import { Aviso } from "../aviso";
import { GrupoDeOpcoes, type OpcaoDoGrupo } from "./grupo-de-opcoes";
import { ListaDeProblemas, type TextosDosProblemas } from "./lista-de-problemas";
import { PreviaDoTema, type TextosDaPrevia } from "./previa-do-tema";
import { SeletorDeCores } from "./seletor-de-cores";

type Mapa = Readonly<Record<string, string>>;

export interface TextosDoEditor {
  readonly titulo: string;
  readonly cores: string;
  readonly familia: string;
  readonly raio: string;
  readonly densidade: string;
  readonly cabecalho: string;
  readonly cartaoDeServico: string;
  readonly textos: string;
  readonly boasVindas: string;
  readonly confirmacao: string;
  readonly salvarRascunho: string;
  readonly publicar: string;
  readonly restaurar: string;
  readonly descartar: string;
  readonly alteracoesNaoSalvas: string;
  readonly rascunhoSalvo: string;
  readonly publicado: string;
  readonly restaurado: string;
  readonly temaInvalido: string;
  readonly origem: Mapa;
  readonly raios: Mapa;
  readonly densidades: Mapa;
  readonly cabecalhos: Mapa;
  readonly cartoes: Mapa;
  readonly recusas: Readonly<Record<MotivoDeRecusaDoTema, string>>;
  readonly problemas: TextosDosProblemas;
  readonly previa: TextosDaPrevia;
}

export interface AcoesDoEditor {
  readonly salvar: (tema: DadosDoTema) => Promise<ResultadoDaAcaoDeTema>;
  readonly publicar: () => Promise<ResultadoDaAcaoDeTema>;
  readonly restaurar: () => Promise<ResultadoDaAcaoDeTema>;
}

interface Props {
  readonly inicial: { readonly tema: DadosDoTema; readonly origem: OrigemDoTema };
  readonly opcoes: OpcoesDeTema;
  readonly textos: TextosDoEditor;
  readonly acoes: AcoesDoEditor;
}

interface Retorno {
  readonly tipo: "erro" | "sucesso";
  readonly texto: string;
}

const comoOpcoes = (ids: readonly string[], rotulos: Mapa): OpcaoDoGrupo[] =>
  ids.map((id) => ({ id, rotulo: rotulos[id] ?? id }));

/** Editor de tema: so estado de tela e chamadas as acoes; as regras vivem em `EditorDeTema`. */
export function EditorDeTemaTela({ inicial, opcoes, textos: t, acoes }: Props) {
  const [editor, setEditor] = useState(() => EditorDeTema.iniciar(inicial.tema));
  const [origem, setOrigem] = useState<OrigemDoTema>(inicial.origem);
  const [retorno, setRetorno] = useState<Retorno | null>(null);
  const [pendente, iniciar] = useTransition();
  const avaliacao = useMemo(() => editor.avaliar(), [editor]);
  const rascunho = editor.rascunho;

  const concluir = (r: ResultadoDaAcaoDeTema, sucesso: string, novaOrigem: OrigemDoTema): void => {
    if (r.ok) {
      setEditor((e) => e.comoSalvo(r.tema));
      setOrigem(novaOrigem);
      setRetorno({ tipo: "sucesso", texto: sucesso });
    } else {
      setRetorno({ tipo: "erro", texto: t.recusas[r.motivo] });
    }
  };
  const salvar = () =>
    iniciar(async () => concluir(await acoes.salvar(rascunho), t.rascunhoSalvo, "rascunho"));
  const restaurar = () =>
    iniciar(async () => concluir(await acoes.restaurar(), t.restaurado, "rascunho"));
  const publicar = () =>
    iniciar(async () => {
      const salvo = await acoes.salvar(rascunho);
      if (!salvo.ok) return concluir(salvo, "", "rascunho");
      concluir(await acoes.publicar(), t.publicado, "publicado");
    });

  return (
    <div className="editor">
      <div>
        <p className="texto-suave">{t.origem[origem]}</p>
        {editor.temAlteracoesNaoSalvas() ? <Aviso>{t.alteracoesNaoSalvas}</Aviso> : null}
        {!avaliacao.valido ? <Aviso tipo="erro">{t.temaInvalido}</Aviso> : null}
        {retorno ? <Aviso tipo={retorno.tipo}>{retorno.texto}</Aviso> : null}

        <h2>{t.cores}</h2>
        <SeletorDeCores
          campos={CAMPOS_DE_COR.filter((c) => opcoes.camposDeCor.includes(c))}
          cores={rascunho.cores}
          rotulos={t.problemas.campoDeCor}
          aoMudar={(campo, valor) => setEditor((e) => e.comCor(campo, valor))}
        />
        <ListaDeProblemas
          problemas={avaliacao.problemasDeContraste}
          textos={t.problemas}
          aoAplicar={(p) => setEditor((e) => e.comSugestao(p))}
          aoCorrigirTodos={() => setEditor((e) => e.comContrasteCorrigido())}
        />

        <GrupoDeOpcoes
          legenda={t.familia}
          nome="familia"
          opcoes={opcoes.familias.map((f) => ({ id: f.id, rotulo: f.nome }))}
          valor={rascunho.familia}
          aoEscolher={(id) => {
            const v = familiaCurada(id);
            if (v) setEditor((e) => e.comFamilia(v));
          }}
        />
        <GrupoDeOpcoes
          legenda={t.raio}
          nome="raio"
          opcoes={comoOpcoes(opcoes.raios.map((r) => r.id), t.raios)}
          valor={rascunho.raio}
          aoEscolher={(id) => {
            const v = raioCurado(id);
            if (v) setEditor((e) => e.comRaio(v));
          }}
        />
        <GrupoDeOpcoes
          legenda={t.densidade}
          nome="densidade"
          opcoes={comoOpcoes(opcoes.densidades.map((d) => d.id), t.densidades)}
          valor={rascunho.densidade}
          aoEscolher={(id) => {
            const v = densidadeCurada(id);
            if (v) setEditor((e) => e.comDensidade(v));
          }}
        />
        <GrupoDeOpcoes
          legenda={t.cabecalho}
          nome="cabecalho"
          opcoes={comoOpcoes(opcoes.cabecalhos, t.cabecalhos)}
          valor={rascunho.cabecalho}
          aoEscolher={(id) => {
            const v = cabecalhoCurado(id);
            if (v) setEditor((e) => e.comCabecalho(v));
          }}
        />
        <GrupoDeOpcoes
          legenda={t.cartaoDeServico}
          nome="cartao"
          opcoes={comoOpcoes(opcoes.cartoesDeServico, t.cartoes)}
          valor={rascunho.cartaoDeServico}
          aoEscolher={(id) => {
            const v = cartaoCurado(id);
            if (v) setEditor((e) => e.comCartaoDeServico(v));
          }}
        />

        <h2>{t.textos}</h2>
        <div className="formulario">
          <div className="campo">
            <label htmlFor="texto-boas-vindas">{t.boasVindas}</label>
            <input
              id="texto-boas-vindas"
              value={rascunho.textos.boasVindas}
              onChange={(ev) => setEditor((e) => e.comTexto("boasVindas", ev.target.value))}
            />
          </div>
          <div className="campo">
            <label htmlFor="texto-confirmacao">{t.confirmacao}</label>
            <input
              id="texto-confirmacao"
              value={rascunho.textos.confirmacao}
              onChange={(ev) => setEditor((e) => e.comTexto("confirmacao", ev.target.value))}
            />
          </div>
        </div>

        <div className="acoes">
          <button type="button" className="botao botao--secundario" disabled={pendente || !avaliacao.podeSalvar} onClick={salvar}>
            {t.salvarRascunho}
          </button>
          <button type="button" className="botao" disabled={pendente || !avaliacao.podePublicar} onClick={publicar}>
            {t.publicar}
          </button>
          <button type="button" className="botao botao--secundario" disabled={pendente} onClick={restaurar}>
            {t.restaurar}
          </button>
          <button type="button" className="botao botao--secundario" disabled={pendente || !editor.temAlteracoesNaoSalvas()} onClick={() => setEditor((e) => e.descartado())}>
            {t.descartar}
          </button>
        </div>
      </div>
      <div className="editor__previa">
        <h2>{t.previa.titulo}</h2>
        <PreviaDoTema tema={rascunho} variaveis={avaliacao.variaveis} textos={t.previa} />
      </div>
    </div>
  );
}
