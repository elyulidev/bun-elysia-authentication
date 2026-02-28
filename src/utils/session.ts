import { redis } from "bun";
import crypto from "crypto";

const SESSION_TTL = 60 * 60 * 24 * 7; // 7 dias em segundos

export async function createSession(userId: string, role: string, cookie: any) {
	// 1. Geramos um ID de sessão longo e aleatório (O Ticket)
	const sessionId = crypto.randomBytes(512).toString("hex"); // 1024 caracteres hexadecimais = 512 bytes de entropia, o que é extremamente seguro contra ataques de força bruta. O normalize() é para evitar problemas com caracteres Unicode em alguns ambientes.
	const ttl = SESSION_TTL; // 7 dias em segundos

	// 2. Guardamos no Redis (A Lista de Convidados)
	// Chave: "session:xyz..." | Valor: Dados do usuário
	await redis.set(
		`session:${sessionId}`,
		JSON.stringify({ userId, role }),
		"EX",
		ttl,
	); // "EX" define o tempo de expiração em segundos

	// 3. Entregamos o Ticket ao navegador (Cookie)
	cookie.sessionID.set({
		value: sessionId,
		httpOnly: true, // JavaScript do navegador NÃO consegue ler (Segurança XSS)
		secure: process.env.NODE_ENV === "production", // En localhost sin HTTPS, secure: true bloquea la cookie
		sameSite: "lax", // Proteção contra CSRF: Crossite Request Forgery
		maxAge: ttl, // Expira junto com o Redis
	});
}

// Renovação com rotação completa do Session ID
export async function rotateSession(
	oldSessionId: string,
	session: { userId: string; role: string },
	cookie: any,
) {
	const newSessionId = crypto.randomBytes(512).toString("hex");
	const ttl = SESSION_TTL;

	// Transação Redis: criar nova sessão e eliminar a antiga
	await Promise.all([
		redis.set(`session:${newSessionId}`, JSON.stringify(session), "EX", ttl),
		redis.del(`session:${oldSessionId}`),
	]);

	// Enviar o novo Session ID ao cliente
	cookie.sessionID.set({
		value: newSessionId,
		httpOnly: true,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax",
		maxAge: ttl,
	});
}
