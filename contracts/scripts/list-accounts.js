const { ethers } = require("hardhat");

async function main() {
    console.log("\n🔑 Available Wallet Addresses for Testing:\n");
    console.log("=".repeat(80));

    const accounts = await ethers.getSigners();

    for (let i = 0; i < Math.min(accounts.length, 10); i++) {
        const balance = await ethers.provider.getBalance(accounts[i].address);
        const balanceInEth = ethers.formatEther(balance);

        console.log(`Account #${i}:`);
        console.log(`  Address: ${accounts[i].address}`);
        console.log(`  Balance: ${balanceInEth} ETH`);
        console.log(`  Use case: ${getUseCase(i)}`);
        console.log("-".repeat(60));
    }

    console.log("\n💡 Copy any of these addresses to use as recipient addresses in transfers!");
    console.log("💡 These are test addresses - never use them on mainnet!");
}

function getUseCase(index) {
    const useCases = [
        "Default contract deployer",
        "Producer #1 wallet",
        "Producer #2 wallet",
        "Industry Buyer #1",
        "Industry Buyer #2",
        "Certification Body",
        "Regulatory Authority",
        "Test Transfer Recipient",
        "Test Transfer Recipient",
        "Test Transfer Recipient"
    ];
    return useCases[index] || "Test wallet";
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
