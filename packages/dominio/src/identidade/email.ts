import { EmailInvalidoError } from "./email-invalido-error";

const PADRAO = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)+$/;
const TAMANHO_MAXIMO = 254;

export class Email {
  private constructor(readonly valor: string) {}

  static de(texto: string): Email {
    const normalizado = texto.trim().toLowerCase();
    if (normalizado.length > TAMANHO_MAXIMO || !PADRAO.test(normalizado)) {
      throw new EmailInvalidoError();
    }
    return new Email(normalizado);
  }

  igual(outro: Email): boolean {
    return this.valor === outro.valor;
  }

  toString(): string {
    return this.valor;
  }
}
