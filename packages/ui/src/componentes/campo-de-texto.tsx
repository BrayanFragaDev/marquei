import { useId, type InputHTMLAttributes } from "react";

export interface PropriedadesDoCampoDeTexto extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "className" | "id" | "aria-describedby"
> {
  /** Rotulo visivel e acessivel (catalogo de mensagens). */
  readonly rotulo: string;
  readonly ajuda?: string;
  readonly erro?: string;
}

export function CampoDeTexto({ rotulo, ajuda, erro, ...entrada }: PropriedadesDoCampoDeTexto) {
  const id = useId();
  const idAjuda = `${id}-ajuda`;
  const idErro = `${id}-erro`;
  const descricao = [ajuda ? idAjuda : null, erro ? idErro : null].filter(Boolean).join(" ");
  return (
    <div className="mq-campo">
      <label className="mq-campo__rotulo" htmlFor={id}>
        {rotulo}
      </label>
      <input
        {...entrada}
        id={id}
        className="mq-campo__entrada"
        aria-invalid={erro ? true : undefined}
        aria-describedby={descricao || undefined}
      />
      {ajuda ? (
        <p id={idAjuda} className="mq-campo__ajuda">
          {ajuda}
        </p>
      ) : null}
      {erro ? (
        <p id={idErro} className="mq-campo__erro" role="alert">
          {erro}
        </p>
      ) : null}
    </div>
  );
}
