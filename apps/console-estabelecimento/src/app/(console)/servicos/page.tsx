import { redirect } from "next/navigation";
import { Aviso } from "../../../componentes/aviso";
import { Campo } from "../../../componentes/campo";
import { FormularioDeAcao } from "../../../componentes/formulario-de-acao";
import { formatarDinheiro, textoEditavelDeCentavos } from "../../../apresentacao/formatador-de-dinheiro";
import { mensagens } from "../../../i18n/mensagens-pt-br";
import { obterContexto } from "../../../servidor/contexto";
import { atualizarServico, criarServico, desativarServico } from "./acoes";

export default async function PaginaDeServicos() {
  const { permissoes, linguagem, servicos } = await obterContexto();
  if (!permissoes.podeVer("servicos")) redirect(permissoes.rotaInicial());
  const m = mensagens.servicos;
  const lista = (await servicos.listar()).filter((s) => s.ativo);
  return (
    <>
      <h1>{linguagem.aplicar(m.titulo)}</h1>
      <Aviso>{m.contratoPendente}</Aviso>
      <section className="cartao" aria-labelledby="novo-servico">
        <h2 id="novo-servico">{linguagem.aplicar(m.novo)}</h2>
        <FormularioDeAcao acao={criarServico} rotuloDoBotao={mensagens.comum.adicionar}>
          <CamposDoServico />
        </FormularioDeAcao>
      </section>
      <div className="tabela-rolavel">
        {lista.map((s) => (
          <section className="cartao" key={s.id}>
            <p className="texto-suave">{formatarDinheiro(s.precoCentavos)}</p>
            <FormularioDeAcao
              acao={atualizarServico.bind(null, s.id)}
              rotuloDoBotao={mensagens.comum.salvar}
            >
              <CamposDoServico id={s.id} valores={s} />
            </FormularioDeAcao>
            <FormularioDeAcao
              acao={desativarServico.bind(null, s.id)}
              rotuloDoBotao={m.desativar}
              variante="perigo"
            />
          </section>
        ))}
      </div>
    </>
  );
}

interface Valores {
  readonly nome: string;
  readonly duracaoMinutos: number;
  readonly precoCentavos: number;
}

function CamposDoServico({ id = "novo", valores }: { readonly id?: string; readonly valores?: Valores }) {
  const m = mensagens.servicos;
  return (
    <>
      <Campo id={`nome-${id}`} nome="nome" rotulo={m.nome} valorInicial={valores?.nome ?? ""} />
      <Campo id={`duracao-${id}`} nome="duracaoMinutos" rotulo={m.duracao} type="number" valorInicial={valores?.duracaoMinutos ?? 30} />
      <Campo id={`preco-${id}`} nome="preco" rotulo={m.preco} valorInicial={valores ? textoEditavelDeCentavos(valores.precoCentavos) : ""} />
    </>
  );
}
