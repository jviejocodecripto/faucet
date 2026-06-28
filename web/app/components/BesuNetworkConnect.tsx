'use client';

import { useState } from 'react';

interface EthereumProvider {
  request: (args: { method: string; params: unknown[] }) => Promise<void>;
}

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export default function BesuNetworkConnect() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  const addBesuNetwork = async () => {
    setLoading(true);
    setResult(null);

    try {
      // Verificar si MetaMask está instalado
      if (typeof window === 'undefined' || !window.ethereum) {
        setResult({
          success: false,
          message: 'MetaMask no está instalado. Por favor, instala MetaMask primero.',
        });
        setLoading(false);
        return;
      }

      // Llamar al método de MetaMask para agregar la red
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [
          {
            chainId: '0x13D52', // 81234 en hexadecimal
            chainName: 'Codecrypto',
            nativeCurrency: {
              name: 'Codecrypto Coin',
              symbol: 'CC',
              decimals: 18,
            },
            rpcUrls: ['https://besu.alumnos.codecrypto.academy',
              'https://besu2.proyectos.codecrypto.academy',
              'https://besu3.proyectos.codecrypto.academy',
              'https://besu4.proyectos.codecrypto.academy'],
            blockExplorerUrls: ['https://besu.alumnos.codecrypto.academy'],
          },
        ],
      });

      setResult({
        success: true,
        message: '✓ Red Codecrypto añadida exitosamente. Puedes cambiar a ella en MetaMask.',
      });
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      setResult({
        success: false,
        message: `Error: ${errorMessage}`,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-8 bg-white dark:bg-zinc-900 rounded-2xl shadow-lg border border-zinc-200 dark:border-zinc-800">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
          Conectar Red Codecrypto
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Añade la red de Codecrypto a MetaMask para interactuar con la blockchain
        </p>
      </div>

      <div className="space-y-4 mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="text-sm text-blue-900 dark:text-blue-200">
          <p className="font-semibold mb-2">Detalles de la Red:</p>
          <ul className="space-y-1 font-mono text-xs">
            <li>
              <span className="font-semibold">Nombre:</span> Codecrypto
            </li>
            <li>
              <span className="font-semibold">Chain ID:</span> 81234
            </li>
            <li>
              <span className="font-semibold">RPC URL:</span> https://besu.alumnos.codecrypto.academy
            </li>
            <li>
              <span className="font-semibold">Moneda:</span> CC (18 decimales)
            </li>
          </ul>
        </div>
      </div>

      <button
        onClick={addBesuNetwork}
        disabled={loading}
        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed"
      >
        {loading ? 'Conectando...' : 'Conectar Red Codecrypto'}
      </button>

      {result && (
        <div
          className={`mt-6 p-4 rounded-lg ${
            result.success
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}
        >
          <p
            className={
              result.success
                ? 'text-green-700 dark:text-green-300'
                : 'text-red-700 dark:text-red-300'
            }
          >
            {result.message}
          </p>
        </div>
      )}
    </div>
  );
}
