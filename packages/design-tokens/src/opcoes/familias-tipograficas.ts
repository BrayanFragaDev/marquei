/** Familias curadas (4 a 6). Nova familia entra aqui, nunca por campo livre. */
export const IDS_DE_FAMILIA = [
  "inter",
  "poppins",
  "montserrat",
  "playfair-display",
  "roboto-slab",
] as const;

export type IdDeFamilia = (typeof IDS_DE_FAMILIA)[number];

interface DadosDaFamilia {
  readonly nome: string;
  readonly pilhaCss: string;
  readonly alternativaNativa: string;
}

const SANS = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';

const FAMILIAS: Readonly<Record<IdDeFamilia, DadosDaFamilia>> = {
  inter: { nome: "Inter", pilhaCss: `"Inter", ${SANS}`, alternativaNativa: "System" },
  poppins: { nome: "Poppins", pilhaCss: `"Poppins", ${SANS}`, alternativaNativa: "System" },
  montserrat: {
    nome: "Montserrat",
    pilhaCss: `"Montserrat", ${SANS}`,
    alternativaNativa: "System",
  },
  "playfair-display": {
    nome: "Playfair Display",
    pilhaCss: `"Playfair Display", ${SERIF}`,
    alternativaNativa: "Georgia",
  },
  "roboto-slab": {
    nome: "Roboto Slab",
    pilhaCss: `"Roboto Slab", ${SERIF}`,
    alternativaNativa: "Georgia",
  },
};

/** Familia tipografica curada, com pilha de fallback para web e nome para React Native. */
export class FamiliaTipografica {
  private constructor(
    readonly id: IdDeFamilia,
    private readonly dados: DadosDaFamilia,
  ) {}

  static de(id: IdDeFamilia): FamiliaTipografica {
    return new FamiliaTipografica(id, FAMILIAS[id]);
  }

  static todas(): readonly FamiliaTipografica[] {
    return IDS_DE_FAMILIA.map((id) => FamiliaTipografica.de(id));
  }

  get nome(): string {
    return this.dados.nome;
  }

  /** Valor para `font-family`, ja com fallback generico. */
  pilhaCss(): string {
    return this.dados.pilhaCss;
  }

  /** Nome registrado no app (ex.: via expo-font) e fonte de sistema para quando nao carregou. */
  fonteNativa(): { readonly familia: string; readonly alternativa: string } {
    return { familia: this.dados.nome, alternativa: this.dados.alternativaNativa };
  }
}
