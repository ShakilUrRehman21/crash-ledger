import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import * as relations from "./relations";

const connectionString = process.env.DATABASE_URL!;

// For migrations / scripts
export const migrationClient = postgres(connectionString, { max: 1 });

// For application queries
const queryClient = postgres(connectionString);
export const db = drizzle(queryClient, { schema: { ...schema, ...relations } });
