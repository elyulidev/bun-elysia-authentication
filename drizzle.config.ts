// drizzle.config.ts
import { defineConfig } from "drizzle-kit";

export default defineConfig({
	schema: "./src/database/schema.ts", // Onde está o seu modelo
	out: "./drizzle", // Onde os arquivos SQL serão salvos
	dialect: "postgresql", // Dialeto do banco de dados
	dbCredentials: {
		url: process.env.DATABASE_URL!, // URL de conexão do .env.local
	},
});
