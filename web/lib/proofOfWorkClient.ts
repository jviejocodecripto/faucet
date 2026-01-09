/**
 * Calcula el proof-of-work en el cliente (browser)
 * @param challenge - El challenge del servidor
 * @param difficulty - Número de ceros requeridos (default: 4)
 * @returns El nonce encontrado
 */
export async function calculateProofOfWork(
  challenge: string,
  difficulty: number = 4
): Promise<string> {
  const prefix = '0'.repeat(difficulty);
  let nonce = 0;
  
  // Usar Web Crypto API para calcular hash en el navegador
  const encoder = new TextEncoder();
  
  while (true) {
    const data = encoder.encode(challenge + nonce.toString());
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    if (hashHex.startsWith(prefix)) {
      return nonce.toString();
    }
    
    nonce++;
    
    // Permitir que el navegador respire cada 10000 iteraciones
    if (nonce % 10000 === 0) {
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
}
