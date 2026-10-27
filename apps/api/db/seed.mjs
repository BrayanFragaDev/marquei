// Dados de desenvolvimento: dois estabelecimentos de verticais diferentes.
// Idempotente (pode rodar varias vezes). A senha dos usuarios vem do ambiente: nada de segredo no repositorio.
import argon2 from "argon2";
import pg from "pg";

const senha = process.env.SEED_SENHA;
const urlDoBanco = process.env.DATABASE_URL;
if (!senha || !urlDoBanco) {
  console.error("Defina DATABASE_URL e SEED_SENHA (veja .env.example).");
  process.exit(1);
}

const ESTABELECIMENTOS = [
  {
    slug: "barbearia-do-ze",
    nome: "Barbearia do Ze",
    vertical: "barbearia",
    equipe: ["Ze", "Beto"],
  },
  {
    slug: "studio-aurora",
    nome: "Studio Aurora",
    vertical: "cabeleireiro",
    equipe: ["Aurora", "Lia"],
  },
];

async function criarServicos(cliente, estabelecimentoId, vertical) {
  const modelo = await cliente.query("SELECT servicos_modelo FROM vertical WHERE slug = $1", [
    vertical,
  ]);
  for (const s of modelo.rows[0].servicos_modelo) {
    await cliente.query(
      `INSERT INTO servico (estabelecimento_id, nome, duracao_minutos, preco_centavos)
       VALUES ($1, $2, $3, $4)`,
      [estabelecimentoId, s.nome, s.duracaoMinutos, s.precoCentavos],
    );
  }
}

async function criarEquipe(cliente, estabelecimentoId, nomes) {
  for (const nome of nomes) {
    await cliente.query("INSERT INTO profissional (estabelecimento_id, nome) VALUES ($1, $2)", [
      estabelecimentoId,
      nome,
    ]);
  }
}

async function criarEstabelecimento(cliente, e, hash) {
  const { rows } = await cliente.query(
    `INSERT INTO estabelecimento (vertical_id, slug, nome)
     VALUES ((SELECT id FROM vertical WHERE slug = $1), $2, $3)
     ON CONFLICT (slug) DO NOTHING RETURNING id`,
    [e.vertical, e.slug, e.nome],
  );
  const criado = rows[0];
  if (!criado) return;
  await criarServicos(cliente, criado.id, e.vertical);
  await cliente.query(
    `INSERT INTO usuario (estabelecimento_id, email, nome, papel, senha_hash)
     VALUES ($1, $2, 'Dono', 'dono', $3)`,
    [criado.id, `dono@${e.slug}.exemplo.test`, hash],
  );
  await criarEquipe(cliente, criado.id, e.equipe);
}

async function semear(cliente) {
  const hash = await argon2.hash(senha, { type: argon2.argon2id });
  for (const e of ESTABELECIMENTOS) await criarEstabelecimento(cliente, e, hash);
}

const cliente = new pg.Client({ connectionString: urlDoBanco });
await cliente.connect();
try {
  await cliente.query("BEGIN");
  await semear(cliente);
  await cliente.query("COMMIT");
  console.log("Seed concluido.");
} catch (erro) {
  await cliente.query("ROLLBACK");
  throw erro;
} finally {
  await cliente.end();
}
