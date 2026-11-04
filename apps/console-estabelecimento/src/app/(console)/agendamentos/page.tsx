import { Aviso } from "../../../componentes/aviso";
import { FormularioDeAcao } from "../../../componentes/formulario-de-acao";
import { formatarDinheiro } from "../../../apresentacao/formatador-de-dinheiro";
import { mensagens } from "../../../i18n/mensagens-pt-br";
import { obterContexto } from "../../../servidor/contexto";
import { cancelarAgendamento } from "./acoes";

interface Props {
  readonly searchParams: Promise<{ readonly dia?: string }>;
}

const DIA_CIVIL = /^\d{4}-\d{2}-\d{2}$/;

export default async function PaginaDeAgendamentos({ searchParams }: Props) {
  const { permissoes, linguagem, fuso, relogio, sessao, agendamentos, servicos, equipe } =
    await obterContexto();
  const m = mensagens.agendamentos;
  const pedido = (await searchParams).dia;
  const dia = pedido && DIA_CIVIL.test(pedido) ? pedido : fuso.diaCivil(relogio.agora());
  const propria = permissoes.soPropriaAgenda();
  const [itens, catalogo, membros] = await Promise.all([
    agendamentos.listarDoDia({ dia, ...(propria ? { profissionalId: sessao.usuarioId } : {}) }),
    servicos.listar(),
    equipe.listar(),
  ]);
  const nomeDoServico = (id: string) => catalogo.find((s) => s.id === id)?.nome ?? "-";
  const nomeDoMembro = (id: string) => membros.find((p) => p.id === id)?.nome ?? "-";
  return (
    <>
      <h1>{linguagem.aplicar(propria ? m.tituloProprio : m.titulo)}</h1>
      <Aviso>{linguagem.aplicar(m.contratoPendente)}</Aviso>
      <form method="get" className="formulario">
        <div className="campo">
          <label htmlFor="dia">{m.dia}</label>
          <input id="dia" name="dia" type="date" defaultValue={dia} />
        </div>
        <button type="submit" className="botao botao--secundario">
          {m.filtrar}
        </button>
      </form>
      {itens.length === 0 ? <p>{linguagem.aplicar(m.nenhum)}</p> : null}
      {itens.length > 0 ? (
        <div className="tabela-rolavel">
          <table className="tabela">
            <thead>
              <tr>
                <th>{m.hora}</th>
                <th>{linguagem.aplicar(m.servico)}</th>
                <th>{linguagem.aplicar(m.profissional)}</th>
                <th>{m.preco}</th>
                <th>{m.status}</th>
                <th>{mensagens.comum.acoes}</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((a) => (
                <tr key={a.id}>
                  <td>{fuso.horaLocal(a.inicio)} - {fuso.horaLocal(a.fim)}</td>
                  <td>{nomeDoServico(a.servicoId)}</td>
                  <td>{nomeDoMembro(a.profissionalId)}</td>
                  <td>{formatarDinheiro(a.precoCentavos)}</td>
                  <td>{m.situacoes[a.status]}</td>
                  <td>
                    {a.status === "confirmado" ? (
                      <FormularioDeAcao
                        acao={cancelarAgendamento.bind(null, a.id)}
                        rotuloDoBotao={m.cancelar}
                        variante="perigo"
                      />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </>
  );
}
