interface Props {
  readonly tipo?: "erro" | "sucesso" | "info";
  readonly children: React.ReactNode;
}

export function Aviso({ tipo = "info", children }: Props) {
  const classe = tipo === "erro" ? "aviso aviso--erro" : tipo === "sucesso" ? "aviso aviso--sucesso" : "aviso";
  return (
    <p className={classe} role={tipo === "erro" ? "alert" : "status"}>
      {children}
    </p>
  );
}
