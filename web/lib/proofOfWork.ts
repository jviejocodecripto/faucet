import { createHash } from 'crypto';

/**
 * Genera un challenge aleatorio para proof-of-work
 */
export function generateChallenge(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15);
}

/**
 * Calcula el hash SHA256 de un string (servidor)
 */
function sha256(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

/**
 * Valida el proof-of-work (servidor)
 * @param challenge - El challenge generado por el servidor
 * @param nonce - El nonce encontrado por el cliente
 * @param difficulty - Número de ceros requeridos al inicio del hash (default: 4)
 */
export function validateProofOfWork(
  challenge: string,
  nonce: string,
  difficulty: number = 4
): boolean {
  const hash = sha256(challenge + nonce);
  const prefix = '0'.repeat(difficulty);
  return hash.startsWith(prefix);
}

