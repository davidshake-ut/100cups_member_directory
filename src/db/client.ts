import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Defer URL validation until the first query so `next build` (which evaluates
// modules without a runtime database) doesn't fail when DATABASE_URL is unset.
const globalForDb = globalThis as unknown as {
  pgClient?: ReturnType<typeof postgres>;
};

const client =
  globalForDb.pgClient ?? postgres(process.env.DATABASE_URL ?? "", { max: 5 });
if (process.env.NODE_ENV !== "production") {
  globalForDb.pgClient = client;
}

export const db = drizzle(client, { schema });
