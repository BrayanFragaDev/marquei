import { DestinatarioInvalidoError } from "./destinatario-invalido-error";
import type { CanalDeMensagem } from "./canal-de-mensagem";
import type { Telefone } from "./telefone";

const PADRAO_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TAMANHO_MAXIMO_EMAIL = 254;
const TAMANHO_MAXIMO_TOKEN_PUSH = 512;
const PADRAO_TOKEN_PUSH = /^\S+$/;

/**
 * Destinatario ja validado para um canal especifico. Um contato de e-mail nunca e aceito
 * como destino de SMS: o canal faz parte do objeto.
 */
export class ContatoDeMensagem {
  private constructor(
    readonly canal: CanalDeMensagem,
    readonly endereco: string,
  ) {}

  static deTelefone(canal: "sms" | "whatsapp", telefone: Telefone): ContatoDeMensagem {
    return new ContatoDeMensagem(canal, telefone.e164);
  }

  static deEmail(texto: string): ContatoDeMensagem {
    const limpo = texto.trim().toLowerCase();
    if (limpo.length > TAMANHO_MAXIMO_EMAIL || !PADRAO_EMAIL.test(limpo)) {
      throw new DestinatarioInvalidoError("e-mail invalido");
    }
    return new ContatoDeMensagem("email", limpo);
  }

  static dePush(token: string): ContatoDeMensagem {
    if (token.length > TAMANHO_MAXIMO_TOKEN_PUSH || !PADRAO_TOKEN_PUSH.test(token)) {
      throw new DestinatarioInvalidoError("token de push invalido");
    }
    return new ContatoDeMensagem("push", token);
  }

  igual(outro: ContatoDeMensagem): boolean {
    return this.canal === outro.canal && this.endereco === outro.endereco;
  }

  /** Forma segura para logs (LGPD): nunca registre o endereco completo. */
  mascarado(): string {
    const visivel = this.endereco.slice(-2);
    return `${this.canal}:***${visivel}`;
  }

  toString(): string {
    return this.mascarado();
  }
}
