import type { DadosDoProblema } from "@marquei/design-tokens";
import { Aviso } from "../aviso";

export interface TextosDosProblemas {
  readonly titulo: string;
  readonly ok: string;
  readonly corrigir: string;
  readonly bloqueiaPublicar: string;
  readonly campoDeCor: Readonly<Record<string, string>>;
  /** Modelo com {primeiro}, {fundo}, {obtido}, {exigido}, {ajustado}, {cor}. */
  readonly problema: string;
  /** Modelo do botao, com {cor}. */
  readonly aplicarSugestao: string;
}

interface Props {
  readonly problemas: readonly DadosDoProblema[];
  readonly textos: TextosDosProblemas;
  readonly aoAplicar: (problema: DadosDoProblema) => void;
  readonly aoCorrigirTodos: () => void;
}

const duasCasas = (n: number): string => (Math.floor(n * 100) / 100).toFixed(2).replace(".", ",");

function descrever(p: DadosDoProblema, t: TextosDosProblemas): string {
  const nome = (campo: string): string => t.campoDeCor[campo] ?? campo;
  return t.problema
    .replace("{primeiro}", nome(p.primeiroPlano))
    .replace("{fundo}", nome(p.fundo))
    .replace("{obtido}", duasCasas(p.razaoObtida))
    .replace("{exigido}", duasCasas(p.razaoExigida))
    .replace("{ajustado}", nome(p.campoAjustado))
    .replace("{cor}", p.corSugerida);
}

/** Problemas de contraste (WCAG AA) com a sugestao de cor do design-tokens. */
export function ListaDeProblemas({ problemas, textos, aoAplicar, aoCorrigirTodos }: Props) {
  if (problemas.length === 0) return <Aviso tipo="sucesso">{textos.ok}</Aviso>;
  return (
    <section aria-labelledby="contraste-titulo">
      <h2 id="contraste-titulo">{textos.titulo}</h2>
      <Aviso tipo="erro">{textos.bloqueiaPublicar}</Aviso>
      <ul>
        {problemas.map((p) => (
          <li key={`${p.primeiroPlano}-${p.fundo}`}>
            {descrever(p, textos)}{" "}
            <button type="button" className="botao botao--secundario" onClick={() => aoAplicar(p)}>
              {textos.aplicarSugestao.replace("{cor}", p.corSugerida)}
            </button>
          </li>
        ))}
      </ul>
      <button type="button" className="botao" onClick={aoCorrigirTodos}>
        {textos.corrigir}
      </button>
    </section>
  );
}
