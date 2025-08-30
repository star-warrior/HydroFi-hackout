const { ethers } = require('ethers');
const fs = require('fs');
const path = require('path');

class BlockchainService {
    constructor() {
        this.provider = null;
        this.contract = null;
        this.wallet = null;
        this.contractAddress = null;
        this.contractABI = null;
        this.initialized = false;
    }

    async initialize() {
        try {
            // Connect to local Hardhat network or other RPC
            const rpcUrl = process.env.BLOCKCHAIN_RPC_URL || 'http://localhost:8545';
            this.provider = new ethers.JsonRpcProvider(rpcUrl);

            // Load contract data
            const contractDataPath = path.join(__dirname, '../contract-data.json');
            if (fs.existsSync(contractDataPath)) {
                const contractData = JSON.parse(fs.readFileSync(contractDataPath, 'utf8'));
                this.contractAddress = contractData.address;
                this.contractABI = JSON.parse(contractData.abi);
            } else {
                throw new Error('Contract data not found. Please deploy the smart contract first.');
            }

            // Initialize wallet (for contract interactions)
            const privateKey = process.env.WALLET_PRIVATE_KEY;
            if (privateKey) {
                this.wallet = new ethers.Wallet(privateKey, this.provider);
                this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.wallet);
            } else {
                // For read-only operations
                this.contract = new ethers.Contract(this.contractAddress, this.contractABI, this.provider);
            }

            this.initialized = true;
            console.log('Blockchain service initialized successfully');
            console.log('Contract address:', this.contractAddress);
        } catch (error) {
            console.error('Failed to initialize blockchain service:', error.message);
            throw error;
        }
    }

    ensureInitialized() {
        if (!this.initialized) {
            throw new Error('Blockchain service not initialized. Call initialize() first.');
        }
    }

    async mintToken(toAddress, factoryId) {
        this.ensureInitialized();

        try {
            console.log('Minting token for address:', toAddress, 'factory:', factoryId);
            const tx = await this.contract.mintToken(toAddress, factoryId);
            console.log('Transaction sent:', tx.hash);

            const receipt = await tx.wait();
            console.log('Transaction receipt:', receipt);

            // Extract token ID from the event
            let tokenId = null;

            // Check for events in the receipt
            if (receipt.logs && receipt.logs.length > 0) {
                // Parse the logs to find the TokenMinted event
                for (const log of receipt.logs) {
                    try {
                        const parsedLog = this.contract.interface.parseLog(log);
                        if (parsedLog.name === 'TokenMinted') {
                            tokenId = parsedLog.args.tokenId.toString();
                            break;
                        }
                    } catch (e) {
                        // Skip logs that can't be parsed
                        continue;
                    }
                }
            }

            // If we couldn't get the tokenId from events, try to get the return value
            if (!tokenId) {
                console.warn('Could not extract tokenId from events, this might cause issues');
                // For now, we'll use a placeholder - in a real scenario, you'd want to handle this better
                const totalTokens = await this.contract.getTotalTokens();
                tokenId = totalTokens.toString();
            }

            console.log('Extracted tokenId:', tokenId);

            return {
                success: true,
                transactionHash: receipt.hash,
                tokenId: tokenId,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            console.error('Error minting token:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async transferToken(from, to, tokenId) {
        this.ensureInitialized();

        try {
            console.log('Transferring token:', tokenId, 'from:', from, 'to:', to);
            const tx = await this.contract.safeTransferFrom(from, to, tokenId, 1, '0x');
            console.log('Transaction sent:', tx.hash);

            const receipt = await tx.wait();
            console.log('Transaction receipt:', receipt);

            return {
                success: true,
                transactionHash: receipt.hash,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            console.error('Error transferring token:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async retireToken(tokenId) {
        this.ensureInitialized();

        try {
            console.log('Retiring token:', tokenId);
            const tx = await this.contract.retireToken(tokenId);
            console.log('Transaction sent:', tx.hash);

            const receipt = await tx.wait();
            console.log('Transaction receipt:', receipt);

            return {
                success: true,
                transactionHash: receipt.hash,
                gasUsed: receipt.gasUsed.toString()
            };
        } catch (error) {
            console.error('Error retiring token:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getTokenMetadata(tokenId) {
        this.ensureInitialized();

        try {
            const metadata = await this.contract.getTokenMetadata(tokenId);

            return {
                success: true,
                metadata: {
                    creator: metadata.creator,
                    creationTimestamp: new Date(Number(metadata.creationTimestamp) * 1000),
                    factoryId: metadata.factoryId,
                    currentOwner: metadata.currentOwner,
                    lastTransferTimestamp: new Date(Number(metadata.lastTransferTimestamp) * 1000),
                    isRetired: metadata.isRetired,
                    retirementTimestamp: metadata.retirementTimestamp > 0 ?
                        new Date(Number(metadata.retirementTimestamp) * 1000) : null,
                    retiredBy: metadata.retiredBy !== '0x0000000000000000000000000000000000000000' ?
                        metadata.retiredBy : null
                }
            };
        } catch (error) {
            console.error('Error getting token metadata:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getAllTokenIds() {
        this.ensureInitialized();

        try {
            const tokenIds = await this.contract.getAllTokenIds();
            return {
                success: true,
                tokenIds: tokenIds.map(id => id.toString())
            };
        } catch (error) {
            console.error('Error getting all token IDs:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getTokensByOwner(ownerAddress) {
        this.ensureInitialized();

        try {
            const tokenIds = await this.contract.getTokensByOwner(ownerAddress);
            return {
                success: true,
                tokenIds: tokenIds.map(id => id.toString())
            };
        } catch (error) {
            console.error('Error getting tokens by owner:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getRetiredTokens() {
        this.ensureInitialized();

        try {
            const tokenIds = await this.contract.getRetiredTokens();
            return {
                success: true,
                tokenIds: tokenIds.map(id => id.toString())
            };
        } catch (error) {
            console.error('Error getting retired tokens:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getTotalTokens() {
        this.ensureInitialized();

        try {
            const total = await this.contract.getTotalTokens();
            return {
                success: true,
                total: total.toString()
            };
        } catch (error) {
            console.error('Error getting total tokens:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    async getAllTokensWithMetadata() {
        this.ensureInitialized();

        try {
            const allTokensResult = await this.getAllTokenIds();
            if (!allTokensResult.success) {
                return allTokensResult;
            }

            const tokensWithMetadata = [];

            for (const tokenId of allTokensResult.tokenIds) {
                const metadataResult = await this.getTokenMetadata(tokenId);
                if (metadataResult.success) {
                    tokensWithMetadata.push({
                        tokenId,
                        ...metadataResult.metadata
                    });
                }
            }

            return {
                success: true,
                tokens: tokensWithMetadata
            };
        } catch (error) {
            console.error('Error getting all tokens with metadata:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = new BlockchainService();
