const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🆓 FREE DEPLOYMENT SCRIPT FOR HYDROFI");
    console.log("=====================================");

    // Get network info
    const network = hre.network.name;
    const [deployer] = await ethers.getSigners();

    // Check if we're on a free network
    const freeNetworks = ['mumbai', 'sepolia', 'bscTestnet'];
    if (!freeNetworks.includes(network)) {
        console.log("⚠️  Warning: You're not deploying to a free network!");
        console.log("💡 Consider using: mumbai, sepolia, or bscTestnet for free deployment");
    }

    console.log("\n📊 Deployment Details:");
    console.log("- Network:", network);
    console.log("- Deployer address:", deployer.address);

    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("- Deployer balance:", ethers.formatEther(balance), "native tokens");

    // Check if we have enough balance
    if (balance === 0n) {
        console.log("\n❌ Error: No funds in deployer wallet!");
        console.log("\n💰 Get free funds from these faucets:");

        if (network === 'mumbai') {
            console.log("🔗 Mumbai Faucet: https://faucet.polygon.technology/");
            console.log("🔗 Alternative: https://mumbaifaucet.com/");
        } else if (network === 'sepolia') {
            console.log("🔗 Sepolia Faucet: https://sepoliafaucet.com/");
            console.log("🔗 Alternative: https://faucet.sepolia.dev/");
        } else if (network === 'bscTestnet') {
            console.log("🔗 BSC Testnet Faucet: https://testnet.binance.org/faucet-smart");
        }

        console.log("\n📋 Steps to get free funds:");
        console.log("1. Copy your wallet address:", deployer.address);
        console.log("2. Visit the faucet link above");
        console.log("3. Paste your address and request funds");
        console.log("4. Wait for the transaction to confirm");
        console.log("5. Run this script again");

        process.exit(1);
    }

    // Deploy the contract
    console.log("\n🔨 Deploying GreenHydrogenCredits contract...");
    const GreenHydrogenCredits = await ethers.getContractFactory("GreenHydrogenCredits");

    // Estimate gas
    const deployTx = await GreenHydrogenCredits.getDeployTransaction();
    const estimatedGas = await deployer.estimateGas(deployTx);
    const feeData = await deployer.provider.getFeeData();

    console.log("\n💰 Cost Estimation:");
    console.log("- Estimated gas:", estimatedGas.toString());
    console.log("- Gas price:", ethers.formatUnits(feeData.gasPrice || 0, "gwei"), "gwei");
    console.log("- Estimated cost:", ethers.formatEther((feeData.gasPrice || 0) * estimatedGas), "tokens");
    console.log("- Cost in USD: ~$0.00 (FREE!)");

    // Deploy with optimized gas settings
    const contract = await GreenHydrogenCredits.deploy({
        gasLimit: estimatedGas + (estimatedGas / 10n), // Add 10% buffer
    });

    console.log("\n⏳ Waiting for deployment...");
    await contract.waitForDeployment();

    const contractAddress = await contract.getAddress();
    const deploymentTx = contract.deploymentTransaction();

    console.log("\n🎉 SUCCESS! Contract deployed for FREE!");
    console.log("========================================");
    console.log("📝 Contract Details:");
    console.log("- Address:", contractAddress);
    console.log("- Network:", network);
    console.log("- Transaction:", deploymentTx.hash);
    console.log("- Block:", deploymentTx.blockNumber || "Pending");

    // Save contract info
    const contractInfo = {
        name: "GreenHydrogenCredits",
        address: contractAddress,
        network: network,
        deployer: deployer.address,
        deploymentTx: deploymentTx.hash,
        timestamp: new Date().toISOString(),
        abi: JSON.parse(contract.interface.formatJson()),
        freeDeployment: true
    };

    // Save to multiple locations
    const backendFile = path.join(__dirname, "../../backend/contract-data.json");
    const deploymentFile = path.join(__dirname, `../deployments/${network}-free-deployment.json`);

    // Ensure directories exist
    if (!fs.existsSync(path.dirname(deploymentFile))) {
        fs.mkdirSync(path.dirname(deploymentFile), { recursive: true });
    }

    fs.writeFileSync(backendFile, JSON.stringify(contractInfo, null, 2));
    fs.writeFileSync(deploymentFile, JSON.stringify(contractInfo, null, 2));

    console.log("\n💾 Contract data saved to:");
    console.log("- Backend:", backendFile);
    console.log("- Deployment record:", deploymentFile);

    // Explorer links
    const explorers = {
        mumbai: `https://mumbai.polygonscan.com/address/${contractAddress}`,
        sepolia: `https://sepolia.etherscan.io/address/${contractAddress}`,
        bscTestnet: `https://testnet.bscscan.com/address/${contractAddress}`
    };

    if (explorers[network]) {
        console.log("\n🔍 View your contract on explorer:");
        console.log(explorers[network]);
    }

    console.log("\n🎯 Next Steps:");
    console.log("1. ✅ Contract deployed successfully");
    console.log("2. 📋 Update your frontend/backend with the new contract address");
    console.log("3. 🔍 Verify your contract (optional):");
    console.log(`   npx hardhat verify --network ${network} ${contractAddress}`);
    console.log("4. 🧪 Test your dApp with the deployed contract");

    console.log("\n💡 Pro Tips:");
    console.log("- Save this contract address:", contractAddress);
    console.log("- This deployment cost you $0.00!");
    console.log("- Your contract is now live on", network);

    return {
        address: contractAddress,
        network: network,
        explorer: explorers[network]
    };
}

main()
    .then((result) => {
        console.log("\n🚀 Deployment completed successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Deployment failed:");
        console.error(error.message);
        process.exit(1);
    });
