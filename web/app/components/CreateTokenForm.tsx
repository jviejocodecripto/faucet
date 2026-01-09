'use client';

import { useState } from 'react';
import { calculateProofOfWork } from '@/lib/proofOfWorkClient';

interface CreateTokenResult {
  success: boolean;
  message?: string;
  error?: string;
  token?: {
    _id: string;
    name: string;
    symbol: string;
    address: string;
    decimals: number;
    initialSupply: string;
  };
  transactionHash?: string;
}

export default function CreateTokenForm() {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [initialSupply, setInitialSupply] = useState('');
  const [decimals, setDecimals] = useState('18');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CreateTokenResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // Obtener challenge y calcular proof-of-work
      const challengeResponse = await fetch('/api/challenge');
      const challengeData = await challengeResponse.json();
      
      if (!challengeResponse.ok || !challengeData.challenge) {
        setResult({
          success: false,
          error: 'Error al obtener challenge. Por favor, intenta de nuevo.',
        });
        setLoading(false);
        return;
      }

      // Calcular proof-of-work (sin mostrar interfaz)
      const nonce = await calculateProofOfWork(challengeData.challenge, challengeData.difficulty || 4);

      const response = await fetch('/api/tokens', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          symbol,
          initialSupply,
          decimals: parseInt(decimals, 10),
          challenge: challengeData.challenge,
          nonce,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          token: data.token,
          transactionHash: data.transactionHash,
        });
        // Limpiar formulario
        setName('');
        setSymbol('');
        setInitialSupply('');
        setDecimals('18');
      } else {
        setResult({
          success: false,
          error: data.error || 'Error desconocido',
        });
      }
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Error al conectar con el servidor',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Crear Token ERC20
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Crea un nuevo token en la blockchain y guárdalo en MongoDB
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Nombre del Token
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Mi Token"
            required
            className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="symbol"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Símbolo
          </label>
          <input
            type="text"
            id="symbol"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="MTK"
            required
            maxLength={10}
            className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="initialSupply"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Supply Inicial
          </label>
          <input
            type="number"
            id="initialSupply"
            value={initialSupply}
            onChange={(e) => setInitialSupply(e.target.value)}
            placeholder="1000000000"
            step="any"
            min="0"
            required
            className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="decimals"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Decimales
          </label>
          <input
            type="number"
            id="decimals"
            value={decimals}
            onChange={(e) => setDecimals(e.target.value)}
            min="0"
            max="18"
            required
            className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed"
        >
          {loading ? 'Creando Token...' : 'Crear Token'}
        </button>
      </form>

      {result && (
        <div
          className={`mt-6 p-4 rounded-lg ${
            result.success
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}
        >
          <h3
            className={`font-semibold mb-2 ${
              result.success
                ? 'text-green-800 dark:text-green-200'
                : 'text-red-800 dark:text-red-200'
            }`}
          >
            {result.success ? 'Éxito' : 'Error'}
          </h3>
          <p
            className={
              result.success
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }
          >
            {result.success ? result.message : result.error}
          </p>
          {result.success && result.token && (
            <div className="mt-3 text-sm">
              <p className="text-green-700 dark:text-green-300">
                <span className="font-medium">Address:</span>{' '}
                <code className="bg-green-100 dark:bg-green-800/50 px-2 py-1 rounded">
                  {result.token.address}
                </code>
              </p>
              {result.transactionHash && (
                <p className="text-green-700 dark:text-green-300 mt-1">
                  <span className="font-medium">Transaction Hash:</span>{' '}
                  <code className="bg-green-100 dark:bg-green-800/50 px-2 py-1 rounded">
                    {result.transactionHash}
                  </code>
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
