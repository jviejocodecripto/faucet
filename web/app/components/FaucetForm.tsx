'use client';

import { useState } from 'react';
import tokenList from '@/lib/erc20.json';

type TokenType = 'native' | 'erc20';

interface Token {
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  initialSupply: string;
}

interface TransactionResult {
  success: boolean;
  message?: string;
  transactionHash?: string;
  blockNumber?: number;
  error?: string;
}

export default function FaucetForm() {
  const tokens = tokenList.tokens as Token[];
  const [tokenType, setTokenType] = useState<TokenType>('native');
  const [tokenAddress, setTokenAddress] = useState(tokens[0]?.address || '');
  const [amount, setAmount] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TransactionResult | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const requestBody: {
        tokenType: TokenType;
        amount: string;
        recipientAddress: string;
        tokenAddress?: string;
      } = {
        tokenType,
        amount,
        recipientAddress,
      };

      // Solo incluir tokenAddress si es ERC20
      if (tokenType === 'erc20') {
        requestBody.tokenAddress = tokenAddress;
      }

      const response = await fetch('/api/faucet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          transactionHash: data.transactionHash,
          blockNumber: data.blockNumber,
        });
        // Limpiar formulario en caso de éxito
        setTokenAddress('');
        setAmount('');
        setRecipientAddress('');
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
          Solicitar Fondos
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Recibe moneda nativa o tokens ERC20
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
            Tipo de Token
          </label>
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => setTokenType('native')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                tokenType === 'native'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              Moneda Nativa
            </button>
            <button
              type="button"
              onClick={() => setTokenType('erc20')}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
                tokenType === 'erc20'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              Token ERC20
            </button>
          </div>
        </div>

        {tokenType === 'erc20' && (
          <div>
            <label
              htmlFor="tokenAddress"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Seleccionar Token
            </label>
            <select
              id="tokenAddress"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors cursor-pointer"
            >
              {tokens.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.name} ({token.symbol}) - {token.address.slice(0, 6)}...{token.address.slice(-4)}
                </option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label
            htmlFor="amount"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Cantidad
          </label>
          <input
            type="number"
            id="amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100"
            step="any"
            min="0"
            required
            className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="recipientAddress"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Tu Wallet Address
          </label>
          <input
            type="text"
            id="recipientAddress"
            value={recipientAddress}
            onChange={(e) => setRecipientAddress(e.target.value)}
            placeholder="0x..."
            required
            className="w-full px-4 py-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-400 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed"
        >
          {loading ? 'Procesando...' : 'Solicitar Fondos'}
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
          {result.transactionHash && (
            <div className="mt-3 text-sm">
              <p className="text-green-700 dark:text-green-300">
                <span className="font-medium">Transaction Hash:</span>{' '}
                <code className="bg-green-100 dark:bg-green-800/50 px-2 py-1 rounded">
                  {result.transactionHash}
                </code>
              </p>
              {result.blockNumber && (
                <p className="text-green-700 dark:text-green-300 mt-1">
                  <span className="font-medium">Block:</span> {result.blockNumber}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
