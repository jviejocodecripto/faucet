# Configuración del Faucet (Moneda Nativa + ERC20)

Este faucet soporta tanto moneda nativa (ETH, MATIC, etc.) como tokens ERC20.

## Pasos de Configuración

### 1. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```bash
cp .env.example .env
```

Luego edita el archivo `.env` con tus datos:

```env
# Private key del wallet emisor (sin el prefijo 0x)
FAUCET_PRIVATE_KEY=tu_private_key_aqui

# RPC URL de la red blockchain (ejemplos abajo)
RPC_URL=https://rpc.example.com

# Chain ID de la red
CHAIN_ID=1
```

### Ejemplos de RPC URLs por red:

**Ethereum Mainnet:**
```
RPC_URL=https://eth-mainnet.g.alchemy.com/v2/TU_API_KEY
CHAIN_ID=1
```

**Ethereum Sepolia (Testnet):**
```
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/TU_API_KEY
CHAIN_ID=11155111
```

**Polygon Mainnet:**
```
RPC_URL=https://polygon-rpc.com
CHAIN_ID=137
```

**Polygon Amoy (Testnet):**
```
RPC_URL=https://rpc-amoy.polygon.technology
CHAIN_ID=80002
```

**Base Mainnet:**
```
RPC_URL=https://mainnet.base.org
CHAIN_ID=8453
```

### 2. Obtener la Private Key

**IMPORTANTE:** Usa una wallet dedicada solo para el faucet, nunca uses tu wallet personal.

Para obtener la private key desde MetaMask:
1. Abre MetaMask
2. Haz clic en los 3 puntos → Account details
3. Haz clic en "Show private key"
4. Ingresa tu contraseña
5. Copia la private key (sin el prefijo 0x)

### 3. Fondear el Wallet del Faucet

El wallet emisor necesita tener:

**Para Faucet de Moneda Nativa (ETH, MATIC, etc.):**
1. **Moneda nativa** suficiente para:
   - Distribuir a los usuarios
   - Pagar el gas de las transacciones

**Para Faucet de Tokens ERC20:**
1. **Tokens ERC20** que quieras distribuir
2. **Moneda nativa** (ETH/MATIC/etc.) para pagar el gas de las transacciones

**Nota:** El mismo wallet puede distribuir tanto moneda nativa como múltiples tokens ERC20.

### 4. Ejecutar la Aplicación

```bash
# Instalar dependencias (si no lo has hecho)
npm install

# Modo desarrollo
npm run dev

# Modo producción
npm run build
npm start
```

La aplicación estará disponible en `http://localhost:3000`

### 5. Configurar Lista de Tokens (Opcional)

El archivo `lib/erc20.json` contiene la lista de tokens ERC20 disponibles en los desplegables. Puedes editar este archivo para agregar o modificar tokens:

```json
{
  "tokens": [
    {
      "name": "Token Name",
      "symbol": "TKN",
      "address": "0x...",
      "decimals": 18,
      "initialSupply": "1000000000"
    }
  ],
  "network": {
    "chainId": 31337,
    "name": "Network Name"
  }
}
```

## Uso del Faucet

La aplicación tiene dos funcionalidades principales:

### A. Consultar Balance
Permite verificar el balance de cualquier wallet address:
- **Moneda Nativa**: Consulta el balance de ETH, MATIC, u otra moneda nativa
- **Token ERC20**: Consulta el balance de cualquier token ERC20 especificando el contrato

### B. Solicitar Fondos

El faucet tiene dos modos:

**Modo Moneda Nativa:**
Los usuarios deben proporcionar:
1. **Cantidad**: Cantidad de moneda nativa a solicitar (ej: 0.1 ETH)
2. **Wallet Address**: Dirección donde recibirán los fondos

**Modo Token ERC20:**
Los usuarios deben:
1. **Seleccionar Token**: Elegir de la lista desplegable (definida en `lib/erc20.json`)
2. **Cantidad**: Cantidad de tokens a solicitar (en unidades del token)
3. **Wallet Address**: Dirección donde recibirán los tokens

**Nota:** Los tokens disponibles están configurados en el archivo `lib/erc20.json`. Puedes agregar o modificar tokens editando este archivo.

## Características de Seguridad

El API del faucet incluye:
- ✅ Validación de direcciones Ethereum
- ✅ Validación de cantidades positivas
- ✅ Verificación de balance del faucet
- ✅ Verificación de balance para gas
- ✅ Manejo de errores detallado
- ✅ Logging de transacciones

## Mejoras Recomendadas para Producción

Para un entorno de producción, considera implementar:

1. **Rate Limiting**: Limitar solicitudes por IP/wallet
2. **Base de Datos**: Registrar todas las transacciones
3. **Límites por Usuario**: Cantidad máxima por wallet/día
4. **Verificación CAPTCHA**: Prevenir bots
5. **Whitelist de Tokens**: Solo permitir tokens específicos
6. **Monitoreo**: Alertas cuando el balance del faucet sea bajo

## Problemas Comunes

### Error: "Configuración del servidor incompleta"
- Verifica que `FAUCET_PRIVATE_KEY` y `RPC_URL` estén configurados en `.env`

### Error: "El faucet no tiene suficiente moneda nativa"
- El wallet emisor no tiene suficiente moneda nativa (ETH, MATIC, etc.)
- Envía más moneda nativa al wallet del faucet

### Error: "El faucet no tiene suficientes tokens"
- El wallet emisor no tiene suficientes tokens ERC20
- Envía más tokens ERC20 al wallet del faucet

### Error: "El wallet del faucet no tiene suficientes fondos para completar la transacción"
- El wallet emisor no tiene suficiente moneda nativa para pagar el gas
- Envía moneda nativa al wallet del faucet para cubrir los costos de gas

### Error: "Token address inválida" o "Recipient address inválida"
- Verifica que las direcciones sean válidas y comiencen con 0x

### Error: "Token address es requerido para tokens ERC20"
- Cuando seleccionas el modo ERC20, debes proporcionar la dirección del token
