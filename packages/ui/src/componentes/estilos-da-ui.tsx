import { ESTILOS_DA_UI } from "../estilos/estilos-da-ui";

/** Injeta a folha de estilos uma unica vez (o React 19 desduplica por `href`). */
export function EstilosDaUi() {
  return (
    <style href="mq-ui" precedence="mq">
      {ESTILOS_DA_UI}
    </style>
  );
}
