# 🌊 HydroFi Smart Contract Deployment Guide

## 🆓 Free Deployment Options

Your HydroFi smart contracts can be deployed **completely FREE** on testnets!

### Quick Start

1. **Navigate to contracts directory:**

   ```bash
   cd contracts
   ```

2. **Check your wallet balance:**

   ```bash
   npm run balance -- --network mumbai
   ```

3. **Deploy to Mumbai (FREE):**
   ```bash
   npm run deploy-mumbai
   ```

### Available Networks

| Network            | Cost     | Faucet                                              | Command                  |
| ------------------ | -------- | --------------------------------------------------- | ------------------------ |
| Mumbai (Polygon)   | **FREE** | [Get MATIC](https://faucet.polygon.technology/)     | `npm run deploy-mumbai`  |
| Sepolia (Ethereum) | **FREE** | [Get ETH](https://sepoliafaucet.com/)               | `npm run deploy-sepolia` |
| BSC Testnet        | **FREE** | [Get BNB](https://testnet.binance.org/faucet-smart) | `npm run deploy-bsc`     |

### Step-by-Step Deployment

#### 1. Setup Environment

Make sure your `.env` file is configured:

```bash
PRIVATE_KEY=your_test_private_key_here
MUMBAI_RPC_URL=https://rpc-mumbai.maticvigil.com
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
BSC_TESTNET_RPC_URL=https://data-seed-prebsc-1-s1.binance.org:8545
```

#### 2. Get Free Testnet Funds

Visit the faucet for your chosen network and request free tokens using your wallet address.

#### 3. Deploy Your Contract

```bash
# Mumbai (Recommended - fastest and cheapest)
npm run deploy-mumbai

# Or use the interactive helper
npm run deploy-free -- --network mumbai
```

#### 4. Verify Deployment

After deployment, you'll see:

- ✅ Contract address
- 🔗 Explorer link to view your contract
- 💾 Contract data saved to `backend/contract-data.json`

### Commands Reference

```bash
# Check wallet balance
npm run balance -- --network mumbai

# Deploy to specific networks
npm run deploy-mumbai      # Deploy to Mumbai
npm run deploy-sepolia     # Deploy to Sepolia
npm run deploy-bsc         # Deploy to BSC Testnet

# General deployment with network flag
npm run deploy-free -- --network mumbai
```

### Troubleshooting

**❌ "Insufficient funds" error:**

- Visit the faucet for your network
- Request free tokens
- Wait for confirmation
- Try deployment again

**❌ "Network not found" error:**

- Check your `.env` file
- Verify RPC URLs are correct
- Make sure network is defined in `hardhat.config.js`

**❌ "Transaction failed" error:**

- Check if you have enough balance
- Try increasing gas limit
- Check network status

### After Deployment

1. **Update Backend:** Contract data is automatically saved to `backend/contract-data.json`
2. **Update Frontend:** Use the contract address in your React app
3. **Test dApp:** Connect your frontend to the deployed contract
4. **Optional:** Verify your contract on the explorer

### Cost Breakdown

| Action          | Mumbai    | Sepolia   | BSC Testnet |
| --------------- | --------- | --------- | ----------- |
| Deploy Contract | $0.00     | $0.00     | $0.00       |
| Mint Tokens     | $0.00     | $0.00     | $0.00       |
| Transfer Tokens | $0.00     | $0.00     | $0.00       |
| **Total Cost**  | **$0.00** | **$0.00** | **$0.00**   |

### Explorer Links

After deployment, view your contract on:

- **Mumbai:** [PolygonScan Mumbai](https://mumbai.polygonscan.com/)
- **Sepolia:** [Etherscan Sepolia](https://sepolia.etherscan.io/)
- **BSC Testnet:** [BscScan Testnet](https://testnet.bscscan.com/)

---

🎉 **Congratulations!** Your HydroFi smart contract is now deployed for free and ready to power your green hydrogen credit system!
