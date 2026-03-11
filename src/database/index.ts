import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import Elysia from "elysia";

const client = postgres(process.env.DATABASE_URL!);

const connectionTest = async () => {
	try {
		await client`SELECT 1`;
	} catch (error) {
		console.error("Error testing database connection:", error);
	}
};
connectionTest();

export const db = drizzle({ client });

export const databasePlugin = new Elysia({ name: "db-plugin" })
	.decorate("db", db)
	.decorate("models", schema);
