export type Rgb = readonly [number, number, number];

/** Cor em matiz (0-360), saturacao e luminosidade (0-1). Imutavel. */
export class Hsl {
  private constructor(
    readonly matiz: number,
    readonly saturacao: number,
    readonly luminosidade: number,
  ) {}

  static deRgb([r, g, b]: Rgb): Hsl {
    const [rn, gn, bn] = [r / 255, g / 255, b / 255] as const;
    const maximo = Math.max(rn, gn, bn);
    const minimo = Math.min(rn, gn, bn);
    const delta = maximo - minimo;
    const luminosidade = (maximo + minimo) / 2;
    if (delta === 0) return new Hsl(0, 0, luminosidade);
    const saturacao = delta / (1 - Math.abs(2 * luminosidade - 1));
    let matiz: number;
    if (maximo === rn) matiz = ((gn - bn) / delta) % 6;
    else if (maximo === gn) matiz = (bn - rn) / delta + 2;
    else matiz = (rn - gn) / delta + 4;
    return new Hsl((matiz * 60 + 360) % 360, saturacao, luminosidade);
  }

  comLuminosidade(luminosidade: number): Hsl {
    return new Hsl(this.matiz, this.saturacao, Math.min(1, Math.max(0, luminosidade)));
  }

  paraRgb(): Rgb {
    const c = (1 - Math.abs(2 * this.luminosidade - 1)) * this.saturacao;
    const x = c * (1 - Math.abs(((this.matiz / 60) % 2) - 1));
    const m = this.luminosidade - c / 2;
    const [r, g, b] = this.componentesDoSetor(c, x);
    return [Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255)];
  }

  private componentesDoSetor(c: number, x: number): Rgb {
    const setor = Math.floor(this.matiz / 60) % 6;
    const tabela: readonly Rgb[] = [
      [c, x, 0],
      [x, c, 0],
      [0, c, x],
      [0, x, c],
      [x, 0, c],
      [c, 0, x],
    ];
    return tabela[setor] ?? [0, 0, 0];
  }
}
