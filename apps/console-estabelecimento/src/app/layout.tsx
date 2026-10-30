import type { Metadata } from "next";
import "../estilos/tokens-do-console.css";
import "../estilos/console.css";

export const metadata: Metadata = {
  title: "Console do estabelecimento",
  robots: { index: false, follow: false },
};

export default function LayoutRaiz({ children }: { readonly children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
