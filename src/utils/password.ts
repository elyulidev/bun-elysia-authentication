// utils/password.ts

/**
 * Hashea uma senha usando Bun.password
 * Argon2id é o algoritmo recomendado por padrão (vencedor do Password Hashing Competition)
 */
export async function hashPassword(password: string): Promise<string> {
	return Bun.password.hash(password, {
		algorithm: "argon2id",
		memoryCost: 65536, // Mais memória = Mais difícil para hackers (GPU/ASIC)
		timeCost: 3, // Número de iterações
	});
}

/**
 * Verifica uma senha contra seu hash armazenado.
 * O Bun detecta automaticamente o algoritmo usado no hash.
 * "Não comparamos senhas. Comparamos verdades."
 */
export async function verifyPassword(
	password: string,
	hash: string,
): Promise<boolean> {
	return Bun.password.verify(password, hash);
}
