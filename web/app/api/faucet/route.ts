import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

const ERC20_ABI = [
  'function transfer(address to, uint256 amount) returns (bool)',
  'function balanceOf(address account) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function symbol() view returns (string)',
];

interface FaucetRequest {
  tokenAddress?: string;
  amount: string;
  recipientAddress: string;
  tokenType: 'native' | 'erc20';
}

export async function POST(request: NextRequest) {
  try {
    const body: FaucetRequest = await request.json();
    const { tokenAddress, amount, recipientAddress, tokenType } = body;

    // Validaciones básicas
    if (!amount || !recipientAddress || !tokenType) {
      return NextResponse.json(
        { error: 'Campos requeridos: amount, recipientAddress, tokenType' },
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
        { error: 'Token address es requerido para tokens ERC20' },
        { status: 400 }
      );
    }

    // Validar token address si es ERC20
    if (tokenType === 'erc20' && !ethers.isAddress(tokenAddress!)) {
      return NextResponse.json(
        { error: 'Token address inválida' },
        { status: 400 }
      );
    }

    // Validar recipient address
    if (!ethers.isAddress(recipientAddress)) {
      return NextResponse.json(
        { error: 'Recipient address inválida' },
        { status: 400 }
      );
    }

    // Validar cantidad
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json(
        { error: 'La cantidad debe ser un número positivo' },
        { status: 400 }
      );
    }

    // Verificar configuración del servidor
    const privateKey = process.env.FAUCET_PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL;

    if (!privateKey || !rpcUrl) {
      console.error('Configuración faltante: FAUCET_PRIVATE_KEY o RPC_URL');
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    // Conectar al proveedor y wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    let tx;
    let receipt;
    let symbol;

    if (tokenType === 'native') {
      // Transferencia de moneda nativa (ETH, MATIC, etc.)
      const amountInWei = ethers.parseEther(amount);

      // Verificar balance del faucet
      const faucetBalance = await provider.getBalance(wallet.address);

      if (faucetBalance < amountInWei) {
        return NextResponse.json(
          { error: 'El faucet no tiene suficiente moneda nativa' },
          { status: 400 }
        );
      }

      // Obtener el símbolo de la red
      const network = await provider.getNetwork();
      // Mapeo común de chainId a símbolo
      const symbolMap: { [key: string]: string } = {
        '1': 'ETH',
        '11155111': 'ETH', // Sepolia
        '137': 'MATIC',
        '31337': 'ETH', // Hardhat , foundry
        '80002': 'MATIC', // Amoy
        '8453': 'ETH', // Base
        '84532': 'ETH', // Base Sepolia
      };
      symbol = symbolMap[network.chainId.toString()] || 'Native Token';

      // Realizar la transferencia
      tx = await wallet.sendTransaction({
        to: recipientAddress,
        value: amountInWei,
      });

      receipt = await tx.wait();

    } else {
      // Transferencia de token ERC20
      const tokenContract = new ethers.Contract(tokenAddress!, ERC20_ABI, wallet);

      // Obtener decimales del token
      const decimals = await tokenContract.decimals();

      // Convertir cantidad a unidades del token
      const amountInWei = ethers.parseUnits(amount, decimals);

      // Verificar balance del faucet
      const faucetBalance = await tokenContract.balanceOf(wallet.address);

      if (faucetBalance < amountInWei) {
        return NextResponse.json(
          { error: 'El faucet no tiene suficientes tokens' },
          { status: 400 }
        );
      }

      // Obtener símbolo del token
      symbol = await tokenContract.symbol();

      // Realizar la transferencia
      tx = await tokenContract.transfer(recipientAddress, amountInWei);
      receipt = await tx.wait();
    }

    return NextResponse.json({
      success: true,
      message: `${amount} ${symbol} enviados exitosamente`,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      from: wallet.address,
      to: recipientAddress,
      amount,
      tokenType,
      token: tokenType === 'erc20' ? tokenAddress : 'NATIVE',
    });

  } catch (error) {
    console.error('Error en faucet:', error);

    // Manejar errores específicos
    if (error instanceof Error) {
      if (error.message.includes('insufficient funds')) {
        return NextResponse.json(
          { error: 'El wallet del faucet no tiene suficientes fondos para completar la transacción' },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { error: `Error al procesar la transacción: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
