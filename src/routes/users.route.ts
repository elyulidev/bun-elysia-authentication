// routes/users.route.ts
import { app } from "../app";
import { eq } from "drizzle-orm";
import { authGuard } from "../guards/auth.guard";

export const usersRoute = app.use(authGuard).get(
	"/users/me",
	async ({ session, db, models, status }) => {
		// session.userId está disponível aqui com TypeScript tipado
		if (!session) throw status(401, "Não autenticado");

		const [user] = await db
			.select()
			.from(models.user)
			.where(eq(models.user.id, session.userId));

		if (!user) throw status(404, "Usuário não encontrado");

		const { password, ...safeUser } = user; // Nunca expomos o hash
		return safeUser;
	},
	{
		requireAuth: true, // ← Assim de simples
	},
);
