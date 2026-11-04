import { Suspense } from "react";
import { TelaAgendar } from "../../../telas/agendar/tela-agendar";

export default function PaginaAgendar() {
  return (
    <Suspense>
      <TelaAgendar />
    </Suspense>
  );
}
