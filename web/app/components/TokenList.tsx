'use client';

import { useState, useEffect } from 'react';

interface Token {
  _id?: string;
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  initialSupply: string;
  createdAt?: string;
}

export default function TokenList() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTokens = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/tokens');
      const data = await response.json();

      if (response.ok) {
        setTokens(data.tokens || []);
        setError(null);
      } else {
        setError(data.error || 'Error al cargar tokens');
      }
    } catch (err) {
      setError('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800">
        <div className="text-center text-zinc-600 dark:text-zinc-400">
          Cargando tokens...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
            Tokens ERC20
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400">
            Lista de tokens creados en la blockchain
          </p>
        </div>
        <button
          onClick={fetchTokens}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Actualizar
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {tokens.length === 0 ? (
        <div className="text-center py-8 text-zinc-600 dark:text-zinc-400">
          No hay tokens creados aún
        </div>
      ) : (
        <div className="space-y-4">
          {tokens.map((token) => (
            <div
              key={token._id || token.address}
              className="p-4 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                    {token.name} ({token.symbol})
                  </h3>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    <span className="font-medium">Address:</span>{' '}
                    <code className="bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded text-xs">
                      {token.address}
                    </code>
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    <span className="font-medium">Supply inicial:</span>{' '}
                    {parseFloat(token.initialSupply).toLocaleString()} {token.symbol}
                  </p>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                    <span className="font-medium">Decimales:</span> {token.decimals}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
