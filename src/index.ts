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
			skip: (req) => {
				console.log("URL>>>", req.url);
				return !req.url.includes("/api/auth");
			},
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
	.onError(({ code, error }) => {
		switch (code) {
			case 400:
				return { status: 400, message: "Bad Request" };
			case 401:
				return { status: 401, message: "Unauthorized" };
			case 404:
				return { status: 404, message: "Not Found" };
			case "VALIDATION":
				return { status: 400, message: error.detail(error.message) };
			default:
				return { status: 500, message: "Internal Server Error" };
		}
	})
	.listen(3000);

console.log(
	`🦊 Elysia is running at ${server.server?.hostname}:${server.server?.port}`,
);
