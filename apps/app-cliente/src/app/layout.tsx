import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { CATALOGO_PT_BR } from "../mensagens/catalogo-pt-br";
import "./globals.css";

export const metadata: Metadata = {
  title: CATALOGO_PT_BR["inicio.titulo"],
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function LayoutRaiz({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
