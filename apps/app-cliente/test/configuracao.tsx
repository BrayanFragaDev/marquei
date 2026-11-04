import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import type { AnchorHTMLAttributes } from "react";
import { afterEach, vi } from "vitest";
import { navegacao } from "./suporte/navegacao";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: navegacao.push, replace: navegacao.replace }),
  useSearchParams: () => navegacao.parametros,
  usePathname: () => navegacao.caminho,
}));

vi.mock("next/link", () => ({
  default: ({ href, ...resto }: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) => (
    <a href={href} {...resto} />
  ),
}));

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  navegacao.push.mockReset();
  navegacao.replace.mockReset();
  navegacao.parametros = new URLSearchParams();
});
