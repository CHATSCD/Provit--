#!/usr/bin/env node
// Applies migrations/*.sql to the deployed Postgres (Neon) database, tracked
// in a `_migrations` table — the production counterpart to the PGLite
// auto-migrate path in src/lib/db.ts. No-ops when DATABASE_URL isn't set
// (e.g. a build that never touches a real database) so `npm run build`
// stays usable without deploy credentials.
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl) {
  console.log("[migrate] DATABASE_URL not set — skipping (PGLite handles its own migrations).");
  process.exit(0);
}

const { Pool } = await import("pg");
const pool = new Pool({ connectionString: databaseUrl });

const migrationsDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../migrations",
);

async function main() {
  const client = await pool.connect();
  try {
    await client.query(
      "create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())",
    );

    const doneRows = await client.query("select name from _migrations");
    const done = new Set(doneRows.rows.map((r) => r.name));

    const files = (await readdir(migrationsDir))
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const name of files) {
      if (done.has(name)) continue;
      const text = await readFile(path.join(migrationsDir, name), "utf8");
      await client.query("begin");
      try {
        await client.query(text);
        await client.query("insert into _migrations (name) values ($1)", [name]);
        await client.query("commit");
        console.log(`[migrate] applied ${name}`);
      } catch (err) {
        await client.query("rollback");
        throw new Error(`[migrate] failed applying ${name}: ${err.message}`, { cause: err });
      }
    }
  } finally {
    client.release();
  }
}

try {
  await main();
} finally {
  await pool.end();
}
