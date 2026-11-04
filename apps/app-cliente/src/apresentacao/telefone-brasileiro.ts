/** Celular brasileiro com DDD (10 ou 11 dígitos). Só normaliza e mascara; a API valida de fato. */
export class TelefoneBrasileiro {
  private constructor(readonly digitos: string) {}

  static criar(entrada: string): TelefoneBrasileiro | null {
    const digitos = entrada.replace(/\D/g, "");
    return /^[1-9]{2}\d{8,9}$/.test(digitos) ? new TelefoneBrasileiro(digitos) : null;
  }

  /** "(11) 9****-4321": nunca mostra o número completo. */
  mascarado(): string {
    const ddd = this.digitos.slice(0, 2);
    const fim = this.digitos.slice(-4);
    return `(${ddd}) ****-${fim}`;
  }
}
