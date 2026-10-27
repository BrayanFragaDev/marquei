import { ContadorDeTentativas, type Instante, type RegistroDeTentativas } from "@marquei/dominio";

const LIMITE_DE_CHAVES = 10_000;

/**
 * Estado por processo (some ao reiniciar e nao e compartilhado entre instancias): suficiente
 * ate existir a versao em Redis. As operacoes sao sincronas por dentro, logo atomicas.
 */
export class RegistroDeTentativasEmMemoria implements RegistroDeTentativas {
  private readonly contadores = new Map<string, ContadorDeTentativas>();

  obter(chave: string): Promise<ContadorDeTentativas> {
    return Promise.resolve(this.contadores.get(chave) ?? ContadorDeTentativas.vazio());
  }

  registrarFalha(chave: string, agora: Instante): Promise<void> {
    const atual = this.contadores.get(chave) ?? ContadorDeTentativas.vazio();
    this.contadores.set(chave, atual.comFalha(agora));
    if (this.contadores.size > LIMITE_DE_CHAVES) this.descartarNaoBloqueados(agora);
    return Promise.resolve();
  }

  zerar(chave: string): Promise<void> {
    this.contadores.delete(chave);
    return Promise.resolve();
  }

  private descartarNaoBloqueados(agora: Instante): void {
    for (const [chave, contador] of this.contadores) {
      if (!contador.bloqueado(agora)) this.contadores.delete(chave);
    }
  }
}
