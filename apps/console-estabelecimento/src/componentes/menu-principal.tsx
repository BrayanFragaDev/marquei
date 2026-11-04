"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export interface ItemDoMenu {
  readonly rota: string;
  readonly rotulo: string;
}

interface Props {
  readonly itens: readonly ItemDoMenu[];
  readonly rotuloDoMenu: string;
}

/** Navegacao lateral; os itens ja chegam filtrados pelo papel (a API ainda e a autoridade). */
export function MenuPrincipal({ itens, rotuloDoMenu }: Props) {
  const caminho = usePathname();
  return (
    <nav aria-label={rotuloDoMenu}>
      <ul className="menu__lista">
        {itens.map((item) => {
          const atual = item.rota === "/" ? caminho === "/" : caminho.startsWith(item.rota);
          return (
            <li key={item.rota}>
              <Link href={item.rota} className="menu__link" aria-current={atual ? "page" : undefined}>
                {item.rotulo}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
