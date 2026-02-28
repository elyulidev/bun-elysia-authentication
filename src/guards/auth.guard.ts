// guards/auth.guard.ts
import Elysia from "elysia";
import { sessionPlugin } from "../plugin/session.plugin";

// Hierarquia de cargos: quanto maior o número, mais privilégios
const ROLE_HIERARCHY: Record<string, number> = {
	user: 1,
	editor: 2,
	admin: 3,
	superadmin: 4,
};

export const authGuard = new Elysia({ name: "auth-guard" })
	.use(sessionPlugin)
	.macro({
		// Criamos uma macro declarativa: requireAuth: true
		requireAuth(enabled: boolean) {
			if (!enabled) return;

			return {
				beforeHandle({ session, status }) {
					if (!session) {
						throw status(401, "Não autenticado. Por favor, inicie sessão.");
					}
				},
			};
		}, // Nova macro: requireRole
		requireRole(role: "user" | "editor" | "admin" | "superadmin") {
			return {
				beforeHandle({ session, status }) {
					// Primeiro verifica autenticação
					if (!session) throw status(401, "Não autenticado");

					const userLevel = ROLE_HIERARCHY[session.role] ?? 0;
					const requiredLevel = ROLE_HIERARCHY[role] ?? 999;

					// Depois verifica autorização
					if (userLevel < requiredLevel) {
						throw status(403, `Acesso negado. Cargo necessário: ${role}`);
					}
				},
			};
		},
	});
