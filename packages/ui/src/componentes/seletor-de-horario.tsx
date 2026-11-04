import { useId } from "react";

export interface OpcaoDeHorario {
  /** Identificador estavel devolvido em `aoSelecionar` (ex.: instante ISO). */
  readonly valor: string;
  /** Texto ja formatado (ex.: "09:30"). */
  readonly rotulo: string;
}

export interface PropriedadesDoSeletorDeHorario {
  readonly legenda: string;
  readonly opcoes: readonly OpcaoDeHorario[];
  readonly valor: string | null;
  readonly aoSelecionar: (valor: string) => void;
  readonly mensagemSemHorarios: string;
}

function SemHorarios({ mensagem }: { mensagem: string }) {
  return (
    <p className="mq-horarios__vazio" role="status">
      {mensagem}
    </p>
  );
}

function Opcao({
  nome,
  opcao,
  marcada,
  aoSelecionar,
}: {
  nome: string;
  opcao: OpcaoDeHorario;
  marcada: boolean;
  aoSelecionar: (valor: string) => void;
}) {
  const id = `${nome}-${opcao.valor}`;
  return (
    <div className="mq-horarios__opcao">
      <input
        className="mq-horarios__entrada"
        type="radio"
        name={nome}
        id={id}
        value={opcao.valor}
        checked={marcada}
        onChange={() => aoSelecionar(opcao.valor)}
      />
      <label className="mq-horarios__rotulo" htmlFor={id}>
        {opcao.rotulo}
      </label>
    </div>
  );
}

/** Grupo de opcoes exclusivas (radios nativos): navegavel por teclado e leitor de tela. */
export function SeletorDeHorario({
  legenda,
  opcoes,
  valor,
  aoSelecionar,
  mensagemSemHorarios,
}: PropriedadesDoSeletorDeHorario) {
  const nome = useId();
  return (
    <fieldset className="mq-horarios">
      <legend className="mq-horarios__legenda">{legenda}</legend>
      {opcoes.length === 0 ? <SemHorarios mensagem={mensagemSemHorarios} /> : null}
      <div className="mq-horarios__lista">
        {opcoes.map((o) => (
          <Opcao
            key={o.valor}
            nome={nome}
            opcao={o}
            marcada={valor === o.valor}
            aoSelecionar={aoSelecionar}
          />
        ))}
      </div>
    </fieldset>
  );
}
