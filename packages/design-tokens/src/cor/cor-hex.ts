import { CorInvalidaError } from "../erros/cor-invalida-error";
import { Hsl, type Rgb } from "./hsl";

export const PADRAO_DE_COR_HEX = /^#[0-9a-fA-F]{6}$/;

const PASSOS_DE_BUSCA = 200;

/** Cor sRGB no formato `#rrggbb` (normalizada em minusculas). Imutavel. */
export class CorHex {
  private constructor(readonly valor: string) {}

  static criar(texto: string): CorHex {
    if (!PADRAO_DE_COR_HEX.test(texto)) throw new CorInvalidaError(texto);
    return new CorHex(texto.toLowerCase());
  }

  static deRgb([r, g, b]: Rgb): CorHex {
    const parte = (n: number) => Math.round(n).toString(16).padStart(2, "0");
    return new CorHex(`#${parte(r)}${parte(g)}${parte(b)}`);
  }

  rgb(): Rgb {
    const parte = (inicio: number) => parseInt(this.valor.slice(inicio, inicio + 2), 16);
    return [parte(1), parte(3), parte(5)];
  }

  /** Luminancia relativa WCAG 2.x (0 = preto, 1 = branco). */
  luminancia(): number {
    const [r, g, b] = this.rgb();
    return 0.2126 * linearizar(r) + 0.7152 * linearizar(g) + 0.0722 * linearizar(b);
  }

  /** Razao de contraste WCAG (1 a 21), simetrica. */
  razaoDeContraste(outra: CorHex): number {
    const [a, b] = [this.luminancia(), outra.luminancia()];
    return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
  }

  luminosidade(): number {
    return Hsl.deRgb(this.rgb()).luminosidade;
  }

  /** Mesmo matiz e saturacao, outra luminosidade HSL (0-1). */
  comLuminosidade(luminosidade: number): CorHex {
    return CorHex.deRgb(Hsl.deRgb(this.rgb()).comLuminosidade(luminosidade).paraRgb());
  }

  /**
   * Correcao deterministica: devolve a cor mais proxima desta (em passos de 0,5% de
   * luminosidade, mesmo matiz) cuja razao sobre `fundo` atinge `minimo`. Testa primeiro o
   * sentido que se afasta do fundo e, no mesmo passo, o sentido oposto.
   */
  comContrasteMinimoSobre(fundo: CorHex, minimo: number): CorHex {
    if (this.razaoDeContraste(fundo) >= minimo) return this;
    const escurecerPrimeiro = fundo.luminancia() > this.luminancia();
    const sentidos = escurecerPrimeiro ? [-1, 1] : [1, -1];
    for (let passo = 1; passo <= PASSOS_DE_BUSCA; passo++) {
      for (const sentido of sentidos) {
        const candidata = this.comLuminosidade(this.luminosidade() + sentido * passo * 0.005);
        if (candidata.razaoDeContraste(fundo) >= minimo) return candidata;
      }
    }
    return this.extremoMaisContrastante(fundo);
  }

  igual(outra: CorHex): boolean {
    return this.valor === outra.valor;
  }

  toString(): string {
    return this.valor;
  }

  private extremoMaisContrastante(fundo: CorHex): CorHex {
    const [escura, clara] = [this.comLuminosidade(0), this.comLuminosidade(1)];
    return escura.razaoDeContraste(fundo) >= clara.razaoDeContraste(fundo) ? escura : clara;
  }
}

function linearizar(canal: number): number {
  const c = canal / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}
