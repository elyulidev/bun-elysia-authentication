// plugins/session.plugin.ts — com renovação automática
import Elysia from "elysia";
import { redis } from "bun";

const SESSION_TTL = 60 * 60 * 24 * 7; // 7 dias
// Limite: renovar quando restar menos de 1 dia de vida
const RENEWAL_THRESHOLD = 60 * 60 * 24; // 1 dia em segundos

export const sessionPlugin = new Elysia({ name: "session-plugin" }).derive(
	{ as: "global" },
	async ({ cookie }) => {
		const sessionId = cookie.sessionID?.value;
		if (!sessionId) return { session: null };

		const key = `session:${sessionId}`;
		const raw = await redis.get(key);
		if (!raw) return { session: null };

		try {
			const session = JSON.parse(raw) as { userId: string; role: string };

			// Verificar o TTL restante
			const remainingTTL = await redis.ttl(key);

			// Se restar menos de 1 dia, renovamos a sessão
			if (remainingTTL > 0 && remainingTTL < RENEWAL_THRESHOLD) {
				//(sliding window)
				await redis.expire(key, SESSION_TTL);
				// Opcional: rotação completa do Session ID para maior segurança
				// await rotateSession(sessionId, session, cookie);

				// Também renovamos o cookie no cliente
				cookie.sessionID.set({
					value: sessionId,
					httpOnly: true,
					secure: process.env.NODE_ENV === "production",
					sameSite: "lax",
					maxAge: SESSION_TTL,
				});
			}

			return { session };
		} catch {
			return { session: null };
		}
	},
);
