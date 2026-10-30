import { redirect } from "next/navigation";
import { Aviso } from "../../../componentes/aviso";
import { Campo } from "../../../componentes/campo";
import { FormularioDeAcao } from "../../../componentes/formulario-de-acao";
import { mensagens } from "../../../i18n/mensagens-pt-br";
import { obterContexto } from "../../../servidor/contexto";
import { atualizarMembro, criarMembro, desativarMembro } from "./acoes";

export default async function PaginaDaEquipe() {
  const { permissoes, linguagem, equipe } = await obterContexto();
  if (!permissoes.podeVer("equipe")) redirect(permissoes.rotaInicial());
  const m = mensagens.equipe;
  // O dono nao e editado aqui: so profissionais e gestores.
  const membros = (await equipe.listar()).filter((e) => e.ativo && e.papel !== "dono");
  return (
    <>
      <h1>{linguagem.aplicar(m.titulo)}</h1>
      <Aviso>{m.contratoPendente}</Aviso>
      <section className="cartao" aria-labelledby="novo-membro">
        <h2 id="novo-membro">{linguagem.aplicar(m.novo)}</h2>
        <FormularioDeAcao acao={criarMembro} rotuloDoBotao={mensagens.comum.adicionar}>
          <CamposDoMembro id="novo" />
        </FormularioDeAcao>
      </section>
      {membros.map((membro) => (
        <section className="cartao" key={membro.id}>
          <FormularioDeAcao
            acao={atualizarMembro.bind(null, membro.id)}
            rotuloDoBotao={mensagens.comum.salvar}
          >
            <CamposDoMembro id={membro.id} nome={membro.nome} papel={membro.papel} />
          </FormularioDeAcao>
          <FormularioDeAcao
            acao={desativarMembro.bind(null, membro.id)}
            rotuloDoBotao={mensagens.servicos.desativar}
            variante="perigo"
          />
        </section>
      ))}
    </>
  );
}

interface PropsDosCampos {
  readonly id: string;
  readonly nome?: string;
  readonly papel?: string;
}

async function CamposDoMembro({ id, nome = "", papel = "profissional" }: PropsDosCampos) {
  const { linguagem } = await obterContexto();
  return (
    <>
      <Campo id={`nome-${id}`} nome="nome" rotulo={mensagens.comum.nome} valorInicial={nome} />
      <div className="campo">
        <label htmlFor={`papel-${id}`}>{mensagens.equipe.papel}</label>
        <select id={`papel-${id}`} name="papel" defaultValue={papel}>
          <option value="profissional">{linguagem.aplicar(mensagens.papeis.profissional)}</option>
          <option value="gestor">{linguagem.aplicar(mensagens.papeis.gestor)}</option>
        </select>
      </div>
    </>
  );
}
