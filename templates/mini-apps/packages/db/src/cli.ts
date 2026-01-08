import { config } from "dotenv";
import { resolve } from "path";

// Load env file before creating client
config({ path: resolve(__dirname, "../../../apps/server/.env") });

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

const client = createClient({
  url: process.env.DATABASE_URL || "",
  authToken: process.env.DATABASE_AUTH_TOKEN,
});

export const db = drizzle({ client, schema });
