import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const ERC20_ABI = [
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
  'function name() view returns (string)',
];

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const tokenAddress = searchParams.get('tokenAddress');
    const tokenType = searchParams.get('tokenType') || 'native';

    // Validar address
    if (!address) {
      return NextResponse.json(
        { error: 'Se requiere el parámetro "address"' },
        { status: 400 }
      );
    }

    if (!ethers.isAddress(address)) {
      return NextResponse.json(
        { error: 'Address inválida' },
        { status: 400 }
      );
    }

    // Validar tokenType
    if (tokenType !== 'native' && tokenType !== 'erc20') {
      return NextResponse.json(
        { error: 'tokenType debe ser "native" o "erc20"' },
        { status: 400 }
      );
    }

    // Para ERC20, tokenAddress es requerido
    if (tokenType === 'erc20' && !tokenAddress) {
      return NextResponse.json(
        { error: 'Se requiere "tokenAddress" para consultar balance de ERC20' },
        { status: 400 }
      );
    }

    // Validar tokenAddress si es ERC20
    if (tokenType === 'erc20' && !ethers.isAddress(tokenAddress!)) {
      return NextResponse.json(
        { error: 'Token address inválida' },
        { status: 400 }
      );
    }

    // Verificar configuración del servidor
    const rpcUrl = process.env.RPC_URL;

    if (!rpcUrl) {
      console.error('Configuración faltante: RPC_URL');
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    // Conectar al proveedor
    const provider = new ethers.JsonRpcProvider(rpcUrl);

    let balance;
    let formattedBalance;
    let symbol;
    let tokenName;
    let decimals;

    if (tokenType === 'native') {
      // Consultar balance de moneda nativa
      const balanceWei = await provider.getBalance(address);
      balance = balanceWei.toString();
      formattedBalance = ethers.formatEther(balanceWei);

      // Obtener el símbolo de la red
      const network = await provider.getNetwork();
      const symbolMap: { [key: string]: string } = {
        '1': 'ETH',
        '11155111': 'ETH', // Sepolia
        '137': 'MATIC',
        '31337': 'ETH', // Hardhat, foundry
        '80002': 'MATIC', // Amoy
        '8453': 'ETH', // Base
        '84532': 'ETH', // Base Sepolia
      };
      symbol = symbolMap[network.chainId.toString()] || 'Native Token';
      tokenName = symbol;
      decimals = 18;

    } else {
      // Consultar balance de token ERC20
      const tokenContract = new ethers.Contract(tokenAddress!, ERC20_ABI, provider);

      try {
        const balanceWei = await tokenContract.balanceOf(address);
        const decimalsValue = await tokenContract.decimals();
        symbol = await tokenContract.symbol();
        tokenName = await tokenContract.name();

        // Convertir BigInt a Number
        decimals = Number(decimalsValue);
        balance = balanceWei.toString();
        formattedBalance = ethers.formatUnits(balanceWei, decimals);
      } catch (error) {
        return NextResponse.json(
          { error: 'Error al consultar el contrato ERC20. Verifica que la dirección sea correcta.' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      address,
      tokenType,
      tokenAddress: tokenType === 'erc20' ? tokenAddress : null,
      balance: {
        raw: balance,
        formatted: formattedBalance,
        decimals,
      },
      token: {
        symbol,
        name: tokenName,
      },
    });

  } catch (error) {
    console.error('Error al consultar balance:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Error al consultar balance: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
