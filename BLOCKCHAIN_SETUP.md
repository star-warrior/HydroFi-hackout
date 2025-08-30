# HydroFi Blockchain Setup Guide

## Overview

This guide will help you set up the complete HydroFi system with blockchain integration for Green Hydrogen Credit tracking using ERC-1155 NFTs.

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (running locally or connection string)
- Git

## Quick Start

### 1. Install Dependencies

#### Backend Dependencies

```bash
cd backend
npm install ethers
```

#### Frontend Dependencies

```bash
cd frontend
npm install ethers
```

#### Smart Contract Dependencies

```bash
cd contracts
npm install
```

### 2. Deploy Smart Contract

#### Option A: Local Hardhat Network (Recommended for testing)

```bash
# Terminal 1 - Start local blockchain
cd contracts
npx hardhat node

# Terminal 2 - Deploy contract
cd contracts
npx hardhat run scripts/deploy.js --network localhost
```

#### Option B: Deploy to testnet (Advanced)

1. Update `contracts/hardhat.config.js` with your network details
2. Add your private key to `backend/.env`
3. Deploy: `npx hardhat run scripts/deploy.js --network <network_name>`

### 3. Start the Application

#### Start Backend

```bash
cd backend
npm run dev
```

#### Start Frontend

```bash
cd frontend
npm run dev
```

## System Features

### 🏭 Producer Dashboard

- **Generate Credits**: Mint new ERC-1155 tokens representing hydrogen credits
- **View Active Credits**: See all minted tokens and their status
- **Retire Credits**: Burn tokens to prevent double-counting
- **Factory Management**: Track production by factory ID

### 🏢 Buyer Dashboard

- **Portfolio View**: See owned credits and their value
- **Transfer Credits**: Send tokens to other addresses
- **Retirement**: Retire owned credits
- **Transaction History**: View purchase and transfer history

### 🏛️ Regulatory Authority Dashboard (Admin)

- **Complete Overview**: See ALL tokens, transactions, and statistics
- **Token Registry**: Full searchable database of all credits
- **Transaction Monitoring**: Real-time view of all blockchain activity
- **Compliance Tracking**: Monitor system-wide metrics
- **Advanced Analytics**: Comprehensive statistics and reporting

### 🛡️ Certification Body Dashboard

- **Verification Registry**: View all verified tokens
- **Facility Certification**: Track certified production facilities
- **Audit Trail**: Complete verification history
- **Quality Assurance**: Token verification and compliance monitoring

## Blockchain Architecture

### Smart Contract (ERC-1155)

- **Token Standard**: ERC-1155 (each token ID has supply of 1, making them NFT-like)
- **Metadata**: Immutable on-chain storage of credit details
- **Functions**:
  - `mintToken()`: Create new credits
  - `safeTransferFrom()`: Transfer credits
  - `retireToken()`: Burn credits
  - `getTokenMetadata()`: Public verification

### Token Metadata Structure

```javascript
{
  creator: address,           // Producer's wallet
  creationTimestamp: uint256, // When created
  factoryId: string,         // Production facility
  currentOwner: address,     // Current holder
  lastTransferTimestamp: uint256,
  isRetired: boolean,        // Retirement status
  retirementTimestamp: uint256,
  retiredBy: address         // Who retired it
}
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Blockchain Operations

- `POST /api/blockchain/mint` - Mint tokens (Producer only)
- `POST /api/blockchain/transfer` - Transfer tokens
- `POST /api/blockchain/retire` - Retire tokens
- `GET /api/blockchain/tokens` - Get tokens by role
- `GET /api/blockchain/stats` - System statistics (Admin only)
- `GET /api/blockchain/transactions` - Transaction history (Admin only)

## User Roles & Permissions

### Producer (`role: 'producer'`)

- ✅ Mint new tokens
- ✅ View own tokens
- ✅ Retire own tokens
- ❌ Admin functions

### Buyer (`role: 'buyer'`)

- ✅ View owned tokens
- ✅ Transfer tokens
- ✅ Retire owned tokens
- ❌ Mint tokens
- ❌ Admin functions

### Regulatory Authority (`role: 'regulatory'`)

- ✅ View ALL tokens and transactions
- ✅ System statistics
- ✅ Complete audit trail
- ✅ Admin dashboard
- ❌ Mint tokens (audit only)

### Certification Body (`role: 'certification'`)

- ✅ View ALL tokens for verification
- ✅ Facility certification tracking
- ✅ Verification dashboard
- ❌ Mint tokens
- ❌ Admin statistics

## Environment Configuration

### Backend (.env)

```properties
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hydrofi_db
JWT_SECRET=your_super_secret_jwt_key_here

# Blockchain Configuration
BLOCKCHAIN_RPC_URL=http://localhost:8545
WALLET_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
DEFAULT_WALLET_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
```

## Demo Workflow

### 1. Register Users

Create accounts for each role:

- Producer: Can mint credits
- Buyer: Can purchase/transfer credits
- Regulatory: Admin access to all data
- Certification: Verification access

### 2. Mint Credits (Producer)

1. Login as Producer
2. Go to Dashboard
3. Enter Factory ID (e.g., "FACTORY-001")
4. Click "Generate 5 Credits"
5. Tokens are minted and visible in "My Active Credits"

### 3. Monitor Activity (Admin)

1. Login as Regulatory Authority
2. View comprehensive dashboard with:
   - All tokens across the system
   - Real-time transaction history
   - System-wide statistics
   - Complete audit trail

### 4. Transfer Credits (Buyer)

1. Login as Buyer
2. View purchased tokens
3. Transfer to other addresses
4. Retire credits when used

## Troubleshooting

### Common Issues

#### 1. Smart Contract Not Deployed

- Error: "Contract data not found"
- Solution: Deploy the smart contract first using Hardhat

#### 2. Blockchain Connection Issues

- Error: "Failed to connect to blockchain"
- Solution: Ensure local Hardhat node is running or update RPC URL

#### 3. Transaction Failures

- Error: "Insufficient funds" or "Transaction reverted"
- Solution: Check wallet has ETH for gas fees (Hardhat provides test ETH)

#### 4. Authentication Issues

- Error: "Access denied"
- Solution: Verify user role matches required permissions

### Support

For technical issues or questions:

1. Check browser console for errors
2. Verify all services are running
3. Check environment variables
4. Ensure MongoDB is connected

## Security Notes

⚠️ **Development Only**: The included private keys and addresses are for development only. Never use these in production.

🔒 **Production Setup**: For production deployment:

- Use secure private key management
- Deploy to mainnet or production testnet
- Implement proper access controls
- Use environment-specific configuration

## Next Steps

1. **Testing**: Use the system to mint, transfer, and retire credits
2. **Integration**: Connect with real wallet providers (MetaMask)
3. **Scaling**: Deploy to production blockchain networks
4. **Features**: Add marketplace functionality, batch operations
5. **Analytics**: Enhanced reporting and compliance features

---

**HydroFi**: Blockchain-Based Green Hydrogen Credit System
_Transparent • Immutable • Compliant_
