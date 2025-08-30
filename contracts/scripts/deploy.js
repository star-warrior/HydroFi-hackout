const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying GreenHydrogenCredits contract...");

  // Get the contract factory
  const GreenHydrogenCredits = await ethers.getContractFactory("GreenHydrogenCredits");

  // Deploy the contract
  const greenHydrogenCredits = await GreenHydrogenCredits.deploy();

  // Wait for deployment to complete
  await greenHydrogenCredits.waitForDeployment();

  const contractAddress = await greenHydrogenCredits.getAddress();
  console.log("GreenHydrogenCredits deployed to:", contractAddress);
  
  // Save the contract address and ABI for the backend
  const fs = require("fs");
  const contractData = {
    address: contractAddress,
    abi: greenHydrogenCredits.interface.formatJson()
  };
  
  fs.writeFileSync(
    "../backend/contract-data.json",
    JSON.stringify(contractData, null, 2)
  );
  
  console.log("Contract data saved to backend/contract-data.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
