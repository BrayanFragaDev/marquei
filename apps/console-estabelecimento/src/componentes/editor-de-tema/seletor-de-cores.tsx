import type { CampoDeCor, DadosDeCores } from "@marquei/design-tokens";

interface Props {
  readonly campos: readonly CampoDeCor[];
  readonly cores: DadosDeCores;
  readonly rotulos: Readonly<Record<string, string>>;
  readonly aoMudar: (campo: CampoDeCor, valor: string) => void;
}

export function SeletorDeCores({ campos, cores, rotulos, aoMudar }: Props) {
  return (
    <div className="cores">
      {campos.map((campo) => (
        <div className="campo" key={campo}>
          <label htmlFor={`cor-${campo}`}>{rotulos[campo] ?? campo}</label>
          <input
            id={`cor-${campo}`}
            type="color"
            value={cores[campo]}
            onChange={(evento) => aoMudar(campo, evento.target.value)}
          />
          <span className="texto-suave">{cores[campo]}</span>
        </div>
      ))}
    </div>
  );
}
