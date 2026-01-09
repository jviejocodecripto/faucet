import { NextResponse } from 'next/server';
import { generateChallenge } from '@/lib/proofOfWork';

/**
 * GET /api/challenge
 * Genera un nuevo challenge para proof-of-work
 */
export async function GET() {
  const challenge = generateChallenge();
  
  return NextResponse.json({
    challenge,
    difficulty: 4, // Número de ceros requeridos al inicio del hash
  });
}
