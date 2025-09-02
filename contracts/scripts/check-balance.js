const { ethers } = require("hardhat");

async function main() {
    const [deployer] = await ethers.getSigners();
    const network = hre.network.name;

    console.log("💰 Wallet Balance Check");
    console.log("=======================");
    console.log("Network:", network);
    console.log("Address:", deployer.address);

    const balance = await deployer.provider.getBalance(deployer.address);
    const balanceEth = ethers.formatEther(balance);

    console.log("Balance:", balanceEth, "tokens");

    if (balance === 0n) {
        console.log("\n❌ No funds! Get free tokens from faucets:");

        const faucets = {
            mumbai: [
                "https://faucet.polygon.technology/",
                "https://mumbaifaucet.com/"
            ],
            sepolia: [
                "https://sepoliafaucet.com/",
                "https://faucet.sepolia.dev/"
            ],
            bscTestnet: [
                "https://testnet.binance.org/faucet-smart"
            ]
        };

        if (faucets[network]) {
            faucets[network].forEach((faucet, index) => {
                console.log(`🔗 Faucet ${index + 1}:`, faucet);
            });
        }
    } else {
        console.log("✅ You have funds! Ready to deploy.");

        // Estimate deployment cost
        try {
            const GreenHydrogenCredits = await ethers.getContractFactory("GreenHydrogenCredits");
            const deployTx = await GreenHydrogenCredits.getDeployTransaction();
            const estimatedGas = await deployer.estimateGas(deployTx);
            const feeData = await deployer.provider.getFeeData();

            const estimatedCost = (feeData.gasPrice || 0) * estimatedGas;
            console.log("\n💸 Estimated deployment cost:", ethers.formatEther(estimatedCost), "tokens");

            if (balance > estimatedCost) {
                console.log("✅ Sufficient balance for deployment!");
            } else {
                console.log("⚠️  May need more funds for deployment");
            }
        } catch (error) {
            console.log("⚠️  Could not estimate deployment cost");
        }
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
