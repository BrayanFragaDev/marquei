import type { NextConfig } from "next";

const configuracao: NextConfig = {
  reactStrictMode: true,
  // Os pacotes do monorepo expoem TypeScript; o Next precisa compila-los.
  transpilePackages: [
    "@marquei/ui",
    "@marquei/design-tokens",
    "@marquei/api-client",
    "@marquei/dominio",
  ],
  poweredByHeader: false,
};

export default configuracao;
