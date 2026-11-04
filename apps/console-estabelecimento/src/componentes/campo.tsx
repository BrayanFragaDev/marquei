interface Props {
  readonly id: string;
  /** Nome do campo no formulario (padrao: o proprio id). */
  readonly nome?: string;
  readonly rotulo: string;
  readonly type?: string;
  readonly valorInicial?: string | number;
  readonly obrigatorio?: boolean;
  readonly passo?: string;
  readonly autoComplete?: string;
}

export function Campo({ id, nome, rotulo, type = "text", valorInicial, obrigatorio = true, passo, autoComplete }: Props) {
  return (
    <div className="campo">
      <label htmlFor={id}>{rotulo}</label>
      <input
        id={id}
        name={nome ?? id}
        type={type}
        required={obrigatorio}
        defaultValue={valorInicial}
        {...(passo ? { step: passo } : {})}
        {...(autoComplete ? { autoComplete } : {})}
      />
    </div>
  );
}
