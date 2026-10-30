import { ResumoDoPainel } from "../../aplicacao/resumo-do-painel";
import { mensagens } from "../../i18n/mensagens-pt-br";
import { obterContexto } from "../../servidor/contexto";
import { redirect } from "next/navigation";

export default async function PaginaDoPainel() {
  const contexto = await obterContexto();
  if (!contexto.permissoes.podeVer("painel")) redirect(contexto.permissoes.rotaInicial());
  const { linguagem, fuso, relogio } = contexto;
  const [servicos, equipe, agenda, tema] = await Promise.all([
    contexto.servicos.listar(),
    contexto.equipe.listar(),
    contexto.agendamentos.listarDoDia({ dia: fuso.diaCivil(relogio.agora()) }),
    contexto.temas.carregarParaEdicao(),
  ]);
  const resumo = new ResumoDoPainel({
    servicosAtivos: servicos.filter((s) => s.ativo).length,
    membrosDaEquipe: equipe.filter((e) => e.ativo && e.papel === "profissional").length,
    agendamentosDoDia: agenda.filter((a) => a.status !== "cancelado").length,
    origemDoTema: tema.origem,
    versaoDoTema: tema.versao,
  });
  const m = mensagens.painel;
  const textoDoTema = {
    publicado: linguagem.aplicar(m.temaPublicado, { versao: resumo.versaoDoTema }),
    padrao: m.temaPadrao,
    com_rascunho: m.temaComRascunho,
  }[resumo.situacaoDoTema()];
  return (
    <>
      <h1>{m.titulo}</h1>
      <div className="grade-de-cartoes">
        <Cartao valor={resumo.servicosAtivos} legenda={linguagem.aplicar(m.servicosAtivos)} />
        <Cartao valor={resumo.membrosDaEquipe} legenda={linguagem.aplicar(m.equipe)} />
        <Cartao valor={resumo.agendamentosDoDia} legenda={linguagem.aplicar(m.agendamentosDoDia)} />
        <Cartao valor={textoDoTema} legenda={m.tema} />
      </div>
      <p className="texto-suave">{m.nota}</p>
    </>
  );
}

function Cartao({ valor, legenda }: { readonly valor: string | number; readonly legenda: string }) {
  return (
    <section className="cartao">
      <p className="cartao__valor">{valor}</p>
      <p className="cartao__legenda">{legenda}</p>
    </section>
  );
}
