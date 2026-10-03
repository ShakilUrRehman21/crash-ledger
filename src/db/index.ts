import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as relations from "./relations";

const connectionString = process.env.DATABASE_URL!;

// Cache the postgres client in development to prevent connection leaks & ECONNRESET on fast refresh
const globalForDb = globalThis as unknown as {
    conn: postgres.Sql | undefined;
};

// For migrations / scripts
export const migrationClient = postgres(connectionString, { max: 1 });

// For application queries
const queryClient = globalForDb.conn ?? postgres(connectionString, {
    prepare: false,
    idle_timeout: 20,
    max_lifetime: 60 * 30,
});
if (process.env.NODE_ENV !== "production") globalForDb.conn = queryClient;

export const db = drizzle(queryClient, { schema: { ...schema, ...relations } });
