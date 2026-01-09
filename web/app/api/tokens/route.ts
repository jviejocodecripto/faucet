import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ethers } from 'ethers';
import TokenABI from '@/lib/token.json';

interface Token {
  _id?: string;
  name: string;
  symbol: string;
  address: string;
  decimals: number;
  initialSupply: string;
  createdAt?: Date;
}

// GET - Listar tokens
export async function GET() {
  try {
    const db = await connectToDatabase();
    const collection = db.collection<Token>('erc20');
    
    const tokens = await collection.find({}).sort({ createdAt: -1 }).toArray();
    
    // Convertir _id a string para serialización JSON
    const tokensWithStringId = tokens.map(token => ({
      ...token,
      _id: token._id?.toString(),
    }));

    return NextResponse.json({ tokens: tokensWithStringId });
  } catch (error) {
    console.error('Error al obtener tokens:', error);
    return NextResponse.json(
      { error: 'Error al obtener tokens de la base de datos' },
      { status: 500 }
    );
  }
}

// POST - Crear token en blockchain y guardar en MongoDB
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, symbol, initialSupply, decimals = 18 } = body;

    // Validaciones
    if (!name || !symbol || !initialSupply) {
      return NextResponse.json(
        { error: 'Campos requeridos: name, symbol, initialSupply' },
        { status: 400 }
      );
    }

    const initialSupplyNum = parseFloat(initialSupply);
    if (isNaN(initialSupplyNum) || initialSupplyNum <= 0) {
      return NextResponse.json(
        { error: 'initialSupply debe ser un número positivo' },
        { status: 400 }
      );
    }

    // Verificar configuración
    const privateKey = process.env.FAUCET_PRIVATE_KEY;
    const rpcUrl = process.env.RPC_URL;

    if (!privateKey || !rpcUrl) {
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    // Conectar al proveedor y wallet
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    // Obtener bytecode del Token
    const tokenBytecode = TokenABI.bytecode.object;
    if (!tokenBytecode) {
      return NextResponse.json(
        { error: 'Bytecode del Token no encontrado' },
        { status: 500 }
      );
    }

    // Crear factory para deployar el contrato Token
    const tokenFactory = new ethers.ContractFactory(
      TokenABI.abi,
      tokenBytecode,
      wallet
    );

    // Convertir initialSupply a wei (con decimales)
    const initialSupplyInWei = ethers.parseUnits(initialSupply, decimals);

    // Deployar el contrato
    const tokenContract = await tokenFactory.deploy(
      name,
      symbol,
      initialSupplyInWei
    );

    await tokenContract.waitForDeployment();
    const tokenAddress = await tokenContract.getAddress();

    // Guardar en MongoDB
    const db = await connectToDatabase();
    const collection = db.collection<Token>('erc20');

    const tokenData: Token = {
      name,
      symbol,
      address: tokenAddress,
      decimals,
      initialSupply,
      createdAt: new Date(),
    };

    const result = await collection.insertOne(tokenData);

    return NextResponse.json({
      success: true,
      message: `Token ${name} (${symbol}) creado exitosamente`,
      token: {
        _id: result.insertedId.toString(),
        ...tokenData,
      },
      transactionHash: tokenContract.deploymentTransaction()?.hash,
    });
  } catch (error) {
    console.error('Error al crear token:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `Error al crear token: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
