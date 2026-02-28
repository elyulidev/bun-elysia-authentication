import { t } from "elysia";
import { hashPassword } from "../utils/password";
import { createSession } from "../utils/session";
import { createInsertSchema } from "drizzle-typebox";
import { table } from "../database/schema";

import { app } from "../app";

// MAGIA: O Esquema do Banco vira Validação da API
const _createUser = createInsertSchema(table.user, {
	email: t.String({ format: "email" }), // Adicionamos regra extra
});

// Removemos campos que o usuário não envia (gerados pelo sistema)
const createUser = t.Omit(_createUser, ["id", "createdAt"]);

export const signUpRoute = app.post(
	"/sign-up",
	async ({ body, cookie, db, models }) => {
		// Simplificado! O Salt é gerado e guardado internamente pelo Bun.password
		const hashedPassword = await hashPassword(body.password);

		const [newUser] = await db
			.insert(models.user)
			.values({
				id: crypto.randomUUID(),
				email: body.email,
				username: body.username,
				password: hashedPassword, // Hash completo
				name: body.name,
				role: "user",
			})
			.returning();

		await createSession(newUser.id, newUser.role, cookie);
		return { success: true };
	},
	{ body: createUser },
);
