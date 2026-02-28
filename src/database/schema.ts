// src/database/schema.ts
import { pgTable, varchar, timestamp, uuid } from "drizzle-orm/pg-core";

export const user = pgTable("user", {
	id: uuid("id").primaryKey(),
	name: varchar("name").notNull(),
	username: varchar("username").notNull().unique(),
	password: varchar("password").notNull(), // Lembre-se: Hash aqui!
	email: varchar("email").notNull().unique(),
	role: varchar("role").notNull().default("user"), // "user" ou "admin"
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Exportamos como um grupo para facilitar
export const table = { user } as const;
