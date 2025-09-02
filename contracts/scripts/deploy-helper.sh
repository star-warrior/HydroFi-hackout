#!/bin/bash

# HydroFi Free Deployment Helper Script
echo "🌊 HydroFi Free Deployment Helper"
echo "================================="

# Check if we're in the right directory
if [ ! -f "hardhat.config.js" ]; then
    echo "❌ Error: Please run this from the contracts directory"
    echo "💡 Navigate to the contracts folder first:"
    echo "   cd contracts"
    exit 1
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file not found"
    echo "💡 Create .env file with your private key and RPC URLs"
    exit 1
fi

echo ""
echo "🎯 Available Free Networks:"
echo "1. Mumbai (Polygon Testnet) - Recommended"
echo "2. Sepolia (Ethereum Testnet)"
echo "3. BSC Testnet (Binance Smart Chain)"
echo ""

read -p "Choose network (1-3): " choice

case $choice in
    1)
        NETWORK="mumbai"
        FAUCET="https://faucet.polygon.technology/"
        ;;
    2)
        NETWORK="sepolia"
        FAUCET="https://sepoliafaucet.com/"
        ;;
    3)
        NETWORK="bscTestnet"
        FAUCET="https://testnet.binance.org/faucet-smart"
        ;;
    *)
        echo "❌ Invalid choice. Using Mumbai as default."
        NETWORK="mumbai"
        FAUCET="https://faucet.polygon.technology/"
        ;;
esac

echo ""
echo "🔗 Selected Network: $NETWORK"
echo "🚰 Faucet: $FAUCET"
echo ""

# Check wallet balance
echo "💰 Checking wallet balance..."
npm run balance -- --network $NETWORK

echo ""
read -p "Do you have funds in your wallet? (y/n): " has_funds

if [ "$has_funds" != "y" ]; then
    echo ""
    echo "💰 Get free funds from: $FAUCET"
    echo "📋 Steps:"
    echo "1. Visit the faucet link"
    echo "2. Enter your wallet address"
    echo "3. Request free tokens"
    echo "4. Wait for confirmation"
    echo "5. Run this script again"
    exit 0
fi

echo ""
echo "🚀 Starting deployment to $NETWORK..."
echo "⏳ This will take a few moments..."

# Run the deployment
npx hardhat run scripts/deploy-free.js --network $NETWORK

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 SUCCESS! Your HydroFi contract is deployed for FREE!"
    echo "📱 Contract data has been saved to your backend"
    echo "🔗 You can now connect your dApp to the deployed contract"
else
    echo ""
    echo "❌ Deployment failed. Please check the error messages above."
    echo "💡 Common solutions:"
    echo "   - Make sure you have enough funds in your wallet"
    echo "   - Check your network connection"
    echo "   - Verify your .env configuration"
fi
