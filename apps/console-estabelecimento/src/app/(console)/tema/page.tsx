import { redirect } from "next/navigation";
import { Aviso } from "../../../componentes/aviso";
import {
  EditorDeTemaTela,
  type TextosDoEditor,
} from "../../../componentes/editor-de-tema/editor-de-tema-tela";
import { FalhaDaApi } from "../../../api/falha-da-api";
import type { Linguagem } from "../../../i18n/linguagem";
import { mensagens } from "../../../i18n/mensagens-pt-br";
import { aoFalharNaSessao, obterContexto } from "../../../servidor/contexto";
import { publicarTema, restaurarPadrao, salvarRascunho } from "./acoes";

function montarTextos(linguagem: Linguagem): TextosDoEditor {
  const t = mensagens.tema;
  const p = mensagens.previa;
  const e = mensagens.erros;
  return {
    ...linguagem.resolver({
      titulo: t.titulo,
      cores: t.cores,
      familia: t.familia,
      raio: t.raio,
      densidade: t.densidade,
      cabecalho: t.cabecalho,
      cartaoDeServico: t.cartaoDeServico,
      textos: t.textos,
      boasVindas: t.boasVindas,
      confirmacao: t.confirmacao,
      salvarRascunho: t.salvarRascunho,
      publicar: t.publicar,
      restaurar: t.restaurar,
      descartar: t.descartar,
      alteracoesNaoSalvas: t.alteracoesNaoSalvas,
      rascunhoSalvo: t.rascunhoSalvo,
      publicado: t.publicado,
      restaurado: t.restaurado,
      temaInvalido: t.temaInvalido,
    }),
    origem: t.origem,
    raios: t.raios,
    densidades: t.densidades,
    cabecalhos: t.cabecalhos,
    cartoes: t.cartoes,
    recusas: {
      tema_invalido: t.temaInvalido,
      sem_permissao: e.semPermissao,
      sem_rascunho: t.semRascunho,
      contraste_insuficiente: t.contrasteBloqueiaPublicar,
      sessao_expirada: e.sessaoExpirada,
    },
    problemas: {
      titulo: t.contrasteTitulo,
      ok: t.contrasteOk,
      corrigir: t.corrigir,
      bloqueiaPublicar: t.contrasteBloqueiaPublicar,
      campoDeCor: t.campoDeCor,
      problema: t.contrasteProblema,
      aplicarSugestao: t.aplicarSugestao,
    },
    previa: {
      titulo: t.previa,
      nomeDeExemplo: p.nomeDeExemplo,
      logo: p.logo,
      pularParaOConteudo: p.pularParaOConteudo,
      reservar: p.reservar,
      servicos: [
        { nome: p.servico1, duracao: p.duracao, preco: p.preco1 },
        { nome: p.servico2, duracao: p.duracao, preco: p.preco2 },
      ],
    },
  };
}

export default async function PaginaDeTema() {
  const contexto = await obterContexto();
  if (!contexto.permissoes.podeVer("tema")) redirect(contexto.permissoes.rotaInicial());
  try {
    const edicao = await contexto.temas.carregarParaEdicao();
    return (
      <>
        <h1>{mensagens.tema.titulo}</h1>
        <EditorDeTemaTela
          inicial={{ tema: edicao.tema, origem: edicao.origem }}
          opcoes={edicao.opcoes}
          textos={montarTextos(contexto.linguagem)}
          acoes={{ salvar: salvarRascunho, publicar: publicarTema, restaurar: restaurarPadrao }}
        />
      </>
    );
  } catch (erro) {
    if (erro instanceof FalhaDaApi && erro.ehSemPermissao()) {
      return <Aviso tipo="erro">{mensagens.erros.semPermissao}</Aviso>;
    }
    return aoFalharNaSessao(erro);
  }
}
