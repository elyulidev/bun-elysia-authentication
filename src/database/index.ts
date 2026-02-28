import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";
import Elysia from "elysia";

export const db = drizzle({ connection: process.env.DATABASE_URL!, schema });

// Convertimos la conexión en un Plugin de Elysia
export const databasePlugin = new Elysia({ name: "db-plugin" })
	.decorate("db", db)
	.decorate("models", schema);
