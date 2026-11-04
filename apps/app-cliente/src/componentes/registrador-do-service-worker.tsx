"use client";

import { useEffect } from "react";

/** Registra o service worker (cache do shell e do tema, fallback offline). Silencioso se não suportado. */
export function RegistradorDoServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator) || process.env.NODE_ENV !== "production") return;
    navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);
  return null;
}
