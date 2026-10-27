// Recria o schema publico do banco LOCAL. Recusa rodar fora de desenvolvimento.
import pg from "pg";

const url = process.env.DATABASE_URL ?? "";
const ehLocal = /@(localhost|127\.0\.0\.1)[:/]/.test(url);
if (!ehLocal || process.env.NODE_ENV === "production") {
  console.error("db:reset so roda em banco local e fora de producao.");
  process.exit(1);
}
const cliente = new pg.Client({ connectionString: url });
await cliente.connect();
try {
  await cliente.query("DROP SCHEMA public CASCADE; CREATE SCHEMA public;");
  console.log("Schema recriado.");
} finally {
  await cliente.end();
}
