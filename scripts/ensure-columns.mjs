// Runs before drizzle-kit migrate to guarantee columns exist.
// Uses IF NOT EXISTS so it is always safe to re-run.
import postgres from "postgres";

const url = process.env.POSTGRES_URL ?? process.env.DATABASE_URL ?? "";
if (!url) {
  console.error("ensure-columns: no DATABASE_URL / POSTGRES_URL set");
  process.exit(1);
}

const sql = postgres(url, { max: 1 });
try {
  await sql`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS photo_data text`;
  console.log("ensure-columns: photo_data column ok");
} catch (err) {
  console.error("ensure-columns: failed:", err);
  process.exit(1);
} finally {
  await sql.end();
}
