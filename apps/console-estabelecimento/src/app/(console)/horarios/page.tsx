import { redirect } from "next/navigation";
import { Aviso } from "../../../componentes/aviso";
import { Campo } from "../../../componentes/campo";
import { FormularioDeAcao } from "../../../componentes/formulario-de-acao";
import { horaDosMinutos } from "../../../apresentacao/hora-do-dia";
import { mensagens } from "../../../i18n/mensagens-pt-br";
import { obterContexto } from "../../../servidor/contexto";
import { adicionarBloqueio, adicionarFolga, adicionarJanela, removerItem } from "./acoes";

interface Props {
  readonly searchParams: Promise<{ readonly profissional?: string }>;
}

export default async function PaginaDeHorarios({ searchParams }: Props) {
  const contexto = await obterContexto();
  const { permissoes, linguagem, equipe, horarios, fuso } = contexto;
  if (!permissoes.podeVer("horarios")) redirect(permissoes.rotaInicial());
  const m = mensagens.horarios;
  const profissionais = (await equipe.listar()).filter((e) => e.ativo && e.papel === "profissional");
  const escolhido = (await searchParams).profissional;
  const atual = profissionais.find((p) => p.id === escolhido) ?? profissionais[0];
  const agenda = atual ? await horarios.obter(atual.id) : null;
  return (
    <>
      <h1>{m.titulo}</h1>
      <Aviso>{m.contratoPendente}</Aviso>
      <form method="get" className="formulario">
        <div className="campo">
          <label htmlFor="profissional">{linguagem.aplicar(m.profissional)}</label>
          <select id="profissional" name="profissional" defaultValue={atual?.id}>
            {profissionais.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="botao botao--secundario">
          {mensagens.agendamentos.filtrar}
        </button>
      </form>
      {atual && agenda ? (
        <>
          <section className="cartao" aria-labelledby="semana">
            <h2 id="semana">{m.semana}</h2>
            <FormularioDeAcao acao={adicionarJanela.bind(null, atual.id)} rotuloDoBotao={mensagens.comum.adicionar}>
              <div className="campo">
                <label htmlFor="diaDaSemana">{m.diaDaSemana}</label>
                <select id="diaDaSemana" name="diaDaSemana">
                  {m.dias.map((dia, indice) => (
                    <option key={dia} value={indice}>
                      {dia}
                    </option>
                  ))}
                </select>
              </div>
              <Campo id="de" rotulo={m.de} type="time" />
              <Campo id="ate" rotulo={m.ate} type="time" />
            </FormularioDeAcao>
            {agenda.janelas.length === 0 ? <p className="texto-suave">{m.semHorarios}</p> : null}
            {agenda.janelas.map((j) => (
              <FormularioDeAcao
                key={j.id}
                acao={removerItem.bind(null, "janela", atual.id, j.id)}
                rotuloDoBotao={mensagens.comum.remover}
                variante="perigo"
              >
                <span>
                  {m.dias[j.diaDaSemana]}: {horaDosMinutos(j.inicioMinutos)} - {horaDosMinutos(j.fimMinutos)}
                </span>
              </FormularioDeAcao>
            ))}
          </section>
          <section className="cartao" aria-labelledby="folgas">
            <h2 id="folgas">{m.folgas}</h2>
            <FormularioDeAcao acao={adicionarFolga.bind(null, atual.id)} rotuloDoBotao={mensagens.comum.adicionar}>
              <Campo id="data" rotulo={m.data} type="date" />
              <Campo id="motivo-folga" nome="motivo" rotulo={m.motivo} obrigatorio={false} />
            </FormularioDeAcao>
            {agenda.folgas.map((f) => (
              <FormularioDeAcao
                key={f.id}
                acao={removerItem.bind(null, "folga", atual.id, f.id)}
                rotuloDoBotao={mensagens.comum.remover}
                variante="perigo"
              >
                <span>
                  {fuso.dataPorExtenso(f.dia)} {f.motivo}
                </span>
              </FormularioDeAcao>
            ))}
          </section>
          <section className="cartao" aria-labelledby="bloqueios">
            <h2 id="bloqueios">{m.bloqueios}</h2>
            <FormularioDeAcao acao={adicionarBloqueio.bind(null, atual.id)} rotuloDoBotao={mensagens.comum.adicionar}>
              <Campo id="inicio" rotulo={m.inicio} type="datetime-local" />
              <Campo id="fim" rotulo={m.fim} type="datetime-local" />
              <Campo id="motivo-bloqueio" nome="motivo" rotulo={m.motivo} obrigatorio={false} />
            </FormularioDeAcao>
            {agenda.bloqueios.map((b) => (
              <FormularioDeAcao
                key={b.id}
                acao={removerItem.bind(null, "bloqueio", atual.id, b.id)}
                rotuloDoBotao={mensagens.comum.remover}
                variante="perigo"
              >
                <span>
                  {fuso.dataPorExtenso(fuso.diaCivilDeIso(b.inicio))} {fuso.horaLocal(b.inicio)} - {fuso.horaLocal(b.fim)} {b.motivo}
                </span>
              </FormularioDeAcao>
            ))}
          </section>
        </>
      ) : null}
    </>
  );
}
