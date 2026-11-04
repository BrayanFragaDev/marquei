import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const raizDoMonorepo = fileURLToPath(new URL("../..", import.meta.url));

const configuracao: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  // Os pacotes do workspace exportam TypeScript; o Next precisa compila-los.
  transpilePackages: ["@marquei/api-client", "@marquei/design-tokens", "@marquei/dominio", "@marquei/ui"],
  turbopack: { root: raizDoMonorepo },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "same-origin" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default configuracao;
