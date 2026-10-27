/** Nivel minimo WCAG AA para um tipo de uso da cor. */
export class RequisitoDeContraste {
  static readonly TEXTO_NORMAL = new RequisitoDeContraste("texto_normal", 4.5);
  static readonly TEXTO_GRANDE_OU_COMPONENTE = new RequisitoDeContraste(
    "texto_grande_ou_componente",
    3,
  );

  private constructor(
    readonly id: string,
    readonly razaoMinima: number,
  ) {}

  atendidoPor(razao: number): boolean {
    return razao >= this.razaoMinima;
  }
}
