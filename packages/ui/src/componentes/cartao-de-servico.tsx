import type { IdDeCartaoDeServico } from "@marquei/design-tokens";
import type { ReactNode } from "react";

export interface PropriedadesDaListaDeCartoes {
  readonly preset: IdDeCartaoDeServico;
  readonly children: ReactNode;
}

/** Lista que organiza os cartoes conforme o preset (coluna, destaque ou grade). */
export function ListaDeCartoes({ preset, children }: PropriedadesDaListaDeCartoes) {
  return <ul className={`mq-lista-cartoes mq-lista-cartoes--${preset}`}>{children}</ul>;
}

export interface PropriedadesDoCartaoDeServico {
  readonly nome: string;
  /** Duracao ja formatada para exibicao (ex.: "30 min"). */
  readonly duracao?: string;
  /** Preco ja formatado (ex.: "R$ 45,00"). */
  readonly preco?: string;
  readonly preset: IdDeCartaoDeServico;
  readonly selecionado?: boolean;
  /** Sem esta funcao o cartao e apenas informativo. */
  readonly aoSelecionar?: () => void;
  /** Rotulo acessivel da acao (catalogo de mensagens), ex.: "Agendar Corte masculino". */
  readonly rotuloDaAcao?: string;
  /** Marca textual do item selecionado, para nao depender so de cor (ex.: "Selecionado"). */
  readonly rotuloDeSelecionado?: string;
}

function Conteudo({
  nome,
  duracao,
  preco,
  marca,
}: {
  nome: string;
  duracao?: string | undefined;
  preco?: string | undefined;
  marca?: string | undefined;
}) {
  return (
    <>
      <span>
        <span className="mq-cartao__nome">
          {marca ? <span className="mq-cartao__marca">{marca} </span> : null}
          {nome}
        </span>
        {duracao ? <span className="mq-cartao__detalhe">{duracao}</span> : null}
      </span>
      {preco ? <span className="mq-cartao__preco">{preco}</span> : null}
    </>
  );
}

export function CartaoDeServico(props: PropriedadesDoCartaoDeServico) {
  const { nome, duracao, preco, preset, selecionado = false, aoSelecionar, rotuloDaAcao } = props;
  const classe = `mq-cartao mq-cartao--${preset}`;
  const marca = selecionado ? props.rotuloDeSelecionado : undefined;
  const conteudo = <Conteudo nome={nome} duracao={duracao} preco={preco} marca={marca} />;
  return (
    <li>
      {aoSelecionar ? (
        <button
          type="button"
          className={classe}
          aria-pressed={selecionado}
          aria-label={rotuloDaAcao}
          onClick={aoSelecionar}
        >
          {conteudo}
        </button>
      ) : (
        <div className={classe}>{conteudo}</div>
      )}
    </li>
  );
}
