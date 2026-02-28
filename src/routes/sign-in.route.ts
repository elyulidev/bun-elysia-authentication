import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "../utils/password";
import { createSession } from "../utils/session";
import { t } from "elysia";
import { app } from "../app";

// Versão robusta contra timing attacks:
const DUMMY_HASH = await hashPassword("dummy-para-timing-constante");

export const signInRoute = app.post(
	"/sign-in",
	async ({ body, db, models, cookie, status }) => {
		const [user] = await db
			.select()
			.from(models.user)
			.where(eq(models.user.email, body.email));

		// Sempre executamos a verificação, mesmo que o usuário não exista
		const hashToVerify = user?.password ?? DUMMY_HASH;
		const isValid = await verifyPassword(body?.password, hashToVerify);

		// Só aqui decidimos se autenticamos
		if (!user || !isValid) {
			throw status(401, "Credenciais inválidas");
		}

		await createSession(user.id, user.role, cookie);
		return { message: "Bem-vindo de volta!" };
	},
	{
		body: t.Object({
			email: t.String({ format: "email" }),
			password: t.String(),
		}),
		cookie: t.Cookie({ sessionID: t.Optional(t.String()) }),
	},
);
