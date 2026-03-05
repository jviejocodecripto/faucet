import FaucetForm from './components/FaucetForm';
import BalanceChecker from './components/BalanceChecker';
import CreateTokenForm from './components/CreateTokenForm';
import TokenList from './components/TokenList';
import BesuNetworkConnect from './components/BesuNetworkConnect';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-blue-50 to-zinc-100 dark:from-zinc-950 dark:via-blue-950 dark:to-zinc-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
            Codecrypto Faucet
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Solicita fondos, consulta balances y gestiona tokens ERC20
          </p>
        </div>

        <div className="mb-8">
          <BesuNetworkConnect />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start mb-8">
          <FaucetForm />
          <BalanceChecker />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <CreateTokenForm />
          <TokenList />
        </div>
      </div>
    </div>
  );
}
