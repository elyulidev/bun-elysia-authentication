// src/index.ts
import { Elysia } from "elysia";
import { usersRoute } from "./routes/users.route";
import { authRoutes } from "./routes/auth.route";
import { rateLimit } from "elysia-rate-limit";
import { adminRoute } from "./routes/admin.route";

const server = new Elysia({
	cookie: {
		secrets: Bun.env.COOKIE_SECRET!, // Debería venir de process.env
		sign: ["sessionID"], // Firma automáticamente esta cookie
	},
})
	.use(
		rateLimit({
			duration: 60 * 1000, // janela de 1 minuto
			max: 10, // máximo de 10 requisições por IP
			skip: (req) => !req.url.includes("/api/auth"), // Não aplicar limite nas rotas de autenticação
		}),
	) // Limite de 10 reqs por minuto, pero sin limitar las rutas de auth
	.get("/", () => ({ message: "Hello, Elysia!" }))
	.group(
		"/api",
		(group) =>
			group
				.use(authRoutes) // /api/auth/sign-in, /sign-up, /logout
				.use(usersRoute) // /api/users/me (requer auth)
				.use(adminRoute), // /api/admin/* (requer roles)
	)
	.onError(({ code, error, status }) => {
		console.log("Code>>", code);
		console.log("Error>>>", (error as Error)?.message);
		switch (code) {
			case "PARSE":
				return status(400, { message: error.message });
			case "INVALID_COOKIE_SIGNATURE":
				return status(400, { message: error.message });
			case "VALIDATION":
				return status(400, { message: error.message });
			case "NOT_FOUND":
				return status(404, { message: error.message });
			default:
				return status(500, {
					message: (error as Error)?.message || "Internal Server Error",
				});
		}
	})
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${server.server?.hostname}:${server.server?.port}`,
);
