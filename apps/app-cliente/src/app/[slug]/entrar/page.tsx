import { Suspense } from "react";
import { TelaEntrar } from "../../../telas/tela-entrar";

export default function Pagina() {
  return (
    <Suspense>
      <TelaEntrar />
    </Suspense>
  );
}
