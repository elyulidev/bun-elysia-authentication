// routes/admin.route.ts
import { app } from "../app";
import { eq } from "drizzle-orm";
import { authGuard } from "../guards/auth.guard";

export const adminRoute = app
	.use(authGuard)

	// Apenas usuários autenticados
	.get(
		"/dashboard",
		async ({ session }) => {
			return { message: `Bem-vindo, ${session!.userId}` };
		},
		{ requireAuth: true },
	)

	// Apenas administradores
	.get(
		"/admin/users",
		async ({ db, models }) => {
			return db.select().from(models.user);
		},
		{ requireRole: "admin" },
	)

	// Apenas superadmins
	.delete(
		"/admin/users/:id",
		async ({ params, db, models }) => {
			await db.delete(models.user).where(eq(models.user.id, params.id));
			return { success: true };
		},
		{ requireRole: "superadmin" },
	);
