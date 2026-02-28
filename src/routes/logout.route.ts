import { redis } from "bun";
import { app } from "../app";
import { t } from "elysia";

// logout.route.ts
export const logoutRoute = app.post(
	"/logout",
	async ({ cookie }) => {
		const sessionId = cookie.sessionID.value;

		if (sessionId) {
			// 1. PRIMEIRO: Eliminamos do servidor (Redis)
			// Mesmo que o cliente conserve o cookie, ele não serve mais
			await redis.del(`session:${sessionId}`);
		}

		// 2. DEPOIS: Eliminamos o cookie do cliente
		cookie.sessionID.remove();

		return { message: "Sessão encerrada com sucesso" };
	},
	{
		cookie: t.Cookie({
			sessionID: t.Optional(t.String()),
		}),
	},
);
