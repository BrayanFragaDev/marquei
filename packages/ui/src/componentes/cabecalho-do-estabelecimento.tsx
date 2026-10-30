import type { IdDeCabecalho } from "@marquei/design-tokens";

export interface PropriedadesDoCabecalho {
  readonly nome: string;
  readonly preset: IdDeCabecalho;
  readonly descricao?: string;
  readonly logoUrl?: string;
  readonly capaUrl?: string;
  /** Texto alternativo do logo (catalogo de mensagens). */
  readonly rotuloDoLogo: string;
}

function Marca({
  nome,
  logoUrl,
  rotuloDoLogo,
}: Pick<PropriedadesDoCabecalho, "nome" | "logoUrl" | "rotuloDoLogo">) {
  if (logoUrl) return <img className="mq-cabecalho__logo" src={logoUrl} alt={rotuloDoLogo} />;
  return (
    <span className="mq-cabecalho__monograma" aria-hidden="true">
      {nome.trim().charAt(0).toLocaleUpperCase()}
    </span>
  );
}

/** Cabecalho do estabelecimento nos tres presets curados: simples, centralizado e capa. */
export function CabecalhoDoEstabelecimento({
  nome,
  preset,
  descricao,
  logoUrl,
  capaUrl,
  rotuloDoLogo,
}: PropriedadesDoCabecalho) {
  return (
    <header className={`mq-cabecalho mq-cabecalho--${preset}`} data-preset={preset}>
      {preset === "capa" && capaUrl ? (
        <img className="mq-cabecalho__capa" src={capaUrl} alt="" />
      ) : null}
      <Marca nome={nome} rotuloDoLogo={rotuloDoLogo} {...(logoUrl ? { logoUrl } : {})} />
      <div className="mq-cabecalho__texto">
        <h1 className="mq-cabecalho__nome">{nome}</h1>
        {descricao ? <p className="mq-cabecalho__descricao">{descricao}</p> : null}
      </div>
    </header>
  );
}
