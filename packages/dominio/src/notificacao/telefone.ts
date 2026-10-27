import { DestinatarioInvalidoError } from "./destinatario-invalido-error";

const SEPARADORES = /[\s\-().]/g;
const PADRAO_E164 = /^\+[1-9]\d{7,14}$/;
const DIGITOS_VISIVEIS_NO_INICIO = 3;
const DIGITOS_VISIVEIS_NO_FIM = 2;

/** Telefone no formato internacional E.164 (ex.: +5511987654321). */
export class Telefone {
  private constructor(readonly e164: string) {}

  /** Aceita separadores comuns (espaco, hifen, parenteses) e exige o `+` do codigo do pais. */
  static de(texto: string): Telefone {
    const limpo = texto.replace(SEPARADORES, "");
    if (!PADRAO_E164.test(limpo)) {
      throw new DestinatarioInvalidoError(
        "telefone fora do formato E.164 (+codigo do pais e numero)",
      );
    }
    return new Telefone(limpo);
  }

  igual(outro: Telefone): boolean {
    return this.e164 === outro.e164;
  }

  /** Forma segura para logs (LGPD): esconde o miolo do numero. */
  mascarado(): string {
    const escondidos = this.e164.length - DIGITOS_VISIVEIS_NO_INICIO - DIGITOS_VISIVEIS_NO_FIM;
    return (
      this.e164.slice(0, DIGITOS_VISIVEIS_NO_INICIO) +
      "*".repeat(escondidos) +
      this.e164.slice(-DIGITOS_VISIVEIS_NO_FIM)
    );
  }

  toString(): string {
    return this.mascarado();
  }
}
