export interface OpcaoDoGrupo {
  readonly id: string;
  readonly rotulo: string;
}

interface Props {
  readonly legenda: string;
  readonly nome: string;
  readonly opcoes: readonly OpcaoDoGrupo[];
  readonly valor: string;
  readonly aoEscolher: (id: string) => void;
}

/** Grupo de opcoes curadas (radio): so oferece o que o catalogo permite. */
export function GrupoDeOpcoes({ legenda, nome, opcoes, valor, aoEscolher }: Props) {
  return (
    <fieldset className="campo">
      <legend>{legenda}</legend>
      <div className="opcoes">
        {opcoes.map((opcao) => (
          <label key={opcao.id}>
            <input
              type="radio"
              name={nome}
              value={opcao.id}
              checked={valor === opcao.id}
              onChange={() => aoEscolher(opcao.id)}
            />
            {opcao.rotulo}
          </label>
        ))}
      </div>
    </fieldset>
  );
}
