const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Starting GreenHydrogenCredits deployment...");

    // Get network info
    const network = hre.network.name;
    const [deployer] = await ethers.getSigners();

    console.log("📊 Deployment Details:");
    console.log("- Network:", network);
    console.log("- Deployer address:", deployer.address);
    console.log("- Deployer balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

    // Get the contract factory
    console.log("\n📋 Getting contract factory...");
    const GreenHydrogenCredits = await ethers.getContractFactory("GreenHydrogenCredits");

    // Estimate deployment cost
    const deploymentData = GreenHydrogenCredits.interface.encodeDeploy([]);
    const estimatedGas = await deployer.estimateGas({ data: deploymentData });
    const gasPrice = await deployer.provider.getFeeData();

    console.log("💰 Deployment Cost Estimation:");
    console.log("- Estimated gas:", estimatedGas.toString());
    console.log("- Gas price:", ethers.formatUnits(gasPrice.gasPrice || 0, "gwei"), "gwei");
    console.log("- Estimated cost:", ethers.formatEther((gasPrice.gasPrice || 0) * estimatedGas), "ETH");

    // Deploy the contract
    console.log("\n🔨 Deploying contract...");
    const greenHydrogenCredits = await GreenHydrogenCredits.deploy();

    // Wait for deployment to complete
    console.log("⏳ Waiting for deployment confirmation...");
    await greenHydrogenCredits.waitForDeployment();

    const contractAddress = await greenHydrogenCredits.getAddress();
    const deploymentTx = greenHydrogenCredits.deploymentTransaction();

    console.log("\n✅ Deployment Successful!");
    console.log("📝 Contract Details:");
    console.log("- Contract address:", contractAddress);
    console.log("- Transaction hash:", deploymentTx.hash);
    console.log("- Block number:", deploymentTx.blockNumber);
    console.log("- Gas used:", deploymentTx.gasLimit?.toString());

    // Save contract data for backend
    const contractData = {
        network: network,
        address: contractAddress,
        deployer: deployer.address,
        transactionHash: deploymentTx.hash,
        blockNumber: deploymentTx.blockNumber,
        timestamp: new Date().toISOString(),
        abi: JSON.parse(greenHydrogenCredits.interface.formatJson())
    };

    // Save to backend directory
    const backendPath = path.join(__dirname, "../../backend/contract-data.json");
    fs.writeFileSync(backendPath, JSON.stringify(contractData, null, 2));
    console.log("💾 Contract data saved to:", backendPath);

    // Save deployment info for reference
    const deploymentInfo = {
        ...contractData,
        gasUsed: deploymentTx.gasLimit?.toString(),
        gasPrice: gasPrice.gasPrice?.toString(),
        estimatedCost: ethers.formatEther((gasPrice.gasPrice || 0) * estimatedGas)
    };

    const deploymentsDir = path.join(__dirname, "../deployments");
    if (!fs.existsSync(deploymentsDir)) {
        fs.mkdirSync(deploymentsDir, { recursive: true });
    }

    const deploymentFile = path.join(deploymentsDir, `${network}-deployment.json`);
    fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
    console.log("📋 Deployment info saved to:", deploymentFile);

    // Network-specific explorer links
    const explorerUrls = {
        sepolia: `https://sepolia.etherscan.io/address/${contractAddress}`,
        goerli: `https://goerli.etherscan.io/address/${contractAddress}`,
        polygon: `https://polygonscan.com/address/${contractAddress}`,
        mumbai: `https://mumbai.polygonscan.com/address/${contractAddress}`,
        bsc: `https://bscscan.com/address/${contractAddress}`,
        bscTestnet: `https://testnet.bscscan.com/address/${contractAddress}`
    };

    if (explorerUrls[network]) {
        console.log("\n🔍 View on Explorer:");
        console.log(explorerUrls[network]);
    }

    console.log("\n🎉 Deployment completed successfully!");

    // Verification reminder
    if (network !== "localhost" && network !== "hardhat") {
        console.log("\n⚠️  Don't forget to verify your contract:");
        console.log(`npx hardhat verify --network ${network} ${contractAddress}`);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("❌ Deployment failed:");
        console.error(error);
        process.exit(1);
    });
