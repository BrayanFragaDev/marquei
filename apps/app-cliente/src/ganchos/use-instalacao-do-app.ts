"use client";

import { useCallback, useEffect, useState } from "react";

interface EventoDeInstalacao extends Event {
  prompt(): Promise<void>;
}

function ehEventoDeInstalacao(evento: Event): evento is EventoDeInstalacao {
  return "prompt" in evento && typeof evento.prompt === "function";
}

/** Captura o `beforeinstallprompt` para oferecer "adicionar à tela inicial" quando o navegador permitir. */
export function useInstalacaoDoApp(): { disponivel: boolean; instalar: () => void } {
  const [evento, definirEvento] = useState<EventoDeInstalacao | null>(null);
  useEffect(() => {
    const ouvir = (e: Event): void => {
      e.preventDefault();
      if (ehEventoDeInstalacao(e)) definirEvento(e);
    };
    window.addEventListener("beforeinstallprompt", ouvir);
    return () => window.removeEventListener("beforeinstallprompt", ouvir);
  }, []);
  const instalar = useCallback(() => {
    void evento?.prompt().finally(() => definirEvento(null));
  }, [evento]);
  return { disponivel: evento !== null, instalar };
}
