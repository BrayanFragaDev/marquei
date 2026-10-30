const PADRAO = /^([01]\d|2[0-3]):([0-5]\d)$/;

/** Converte `HH:MM` em minutos desde 00:00; `null` se invalido. */
export function minutosDaHora(texto: string): number | null {
  const partes = PADRAO.exec(texto);
  if (!partes) return null;
  return Number(partes[1]) * 60 + Number(partes[2]);
}

export function horaDosMinutos(minutos: number): string {
  const h = String(Math.floor(minutos / 60)).padStart(2, "0");
  const m = String(minutos % 60).padStart(2, "0");
  return `${h}:${m}`;
}
