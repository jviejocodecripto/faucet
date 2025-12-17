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

interface BalanceResult {
  success: boolean;
  address?: string;
  tokenType?: string;
  tokenAddress?: string | null;
  balance?: {
    raw: string;
    formatted: string;
    decimals: number;
  };
  token?: {
    symbol: string;
    name: string;
  };
  error?: string;
}

export default function BalanceChecker() {
  const tokens = tokenList.tokens as Token[];
  const [tokenType, setTokenType] = useState<TokenType>('native');
  const [address, setAddress] = useState('');
  const [tokenAddress, setTokenAddress] = useState(tokens[0]?.address || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<BalanceResult | null>(null);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const params = new URLSearchParams({
        address,
        tokenType,
      });

      if (tokenType === 'erc20' && tokenAddress) {
        params.append('tokenAddress', tokenAddress);
      }

      const response = await fetch(`/api/balance?${params.toString()}`);
      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setResult({
          success: false,
          error: data.error || 'Error al consultar balance',
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
          Consultar Balance
        </h2>
        <p className="text-zinc-600 dark:text-zinc-400">
          Verifica el balance de cualquier wallet
        </p>
      </div>

      <form onSubmit={handleCheck} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
            Tipo de Balance
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTokenType('native')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                tokenType === 'native'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              Moneda Nativa
            </button>
            <button
              type="button"
              onClick={() => setTokenType('erc20')}
              className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium transition-all ${
                tokenType === 'erc20'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
              }`}
            >
              Token ERC20
            </button>
          </div>
        </div>

        <div>
          <label
            htmlFor="checkAddress"
            className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Wallet Address
          </label>
          <input
            type="text"
            id="checkAddress"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="0x..."
            required
            className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm"
          />
        </div>

        {tokenType === 'erc20' && (
          <div>
            <label
              htmlFor="checkTokenAddress"
              className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
            >
              Seleccionar Token
            </label>
            <select
              id="checkTokenAddress"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              required
              className="w-full px-4 py-2.5 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-colors text-sm cursor-pointer"
            >
              {tokens.map((token) => (
                <option key={token.address} value={token.address}>
                  {token.name} ({token.symbol}) - {token.address.slice(0, 6)}...{token.address.slice(-4)}
                </option>
              ))}
            </select>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-6 bg-purple-600 hover:bg-purple-700 disabled:bg-zinc-400 text-white font-semibold rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed text-sm"
        >
          {loading ? 'Consultando...' : 'Consultar Balance'}
        </button>
      </form>

      {result && (
        <div
          className={`mt-5 p-4 rounded-lg ${
            result.success
              ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800'
              : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
          }`}
        >
          {result.success ? (
            <div>
              <h3 className="font-semibold text-purple-900 dark:text-purple-200 mb-3">
                Balance de {result.token?.name}
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-purple-700 dark:text-purple-300 font-medium">
                    Cantidad:
                  </span>
                  <span className="text-purple-900 dark:text-purple-100 font-bold text-lg">
                    {parseFloat(result.balance!.formatted).toLocaleString(undefined, {
                      maximumFractionDigits: 6,
                    })}{' '}
                    {result.token?.symbol}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-purple-200 dark:border-purple-800">
                  <span className="text-purple-700 dark:text-purple-300">Address:</span>
                  <code className="text-purple-800 dark:text-purple-200 text-xs bg-purple-100 dark:bg-purple-900/50 px-2 py-1 rounded">
                    {result.address?.slice(0, 6)}...{result.address?.slice(-4)}
                  </code>
                </div>
                {result.tokenAddress && (
                  <div className="flex justify-between items-center">
                    <span className="text-purple-700 dark:text-purple-300">Token:</span>
                    <code className="text-purple-800 dark:text-purple-200 text-xs bg-purple-100 dark:bg-purple-900/50 px-2 py-1 rounded">
                      {result.tokenAddress.slice(0, 6)}...{result.tokenAddress.slice(-4)}
                    </code>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div>
              <h3 className="font-semibold text-red-800 dark:text-red-200 mb-2">
                Error
              </h3>
              <p className="text-red-700 dark:text-red-300 text-sm">{result.error}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
