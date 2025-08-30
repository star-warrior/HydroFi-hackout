const express = require('express');
const router = express.Router();
const blockchainService = require('../services/blockchainService');
const Transaction = require('../models/Transaction');
const { auth } = require('../middleware/auth');

// Initialize blockchain service
blockchainService.initialize().catch(console.error);

// Middleware to check if user is a producer
const requireProducer = (req, res, next) => {
    if (req.user.role !== 'Green Hydrogen Producer') {
        return res.status(403).json({ message: 'Access denied. Producer role required.' });
    }
    next();
};

// Middleware to check if user is admin (regulatory authority)
const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'Regulatory Authority') {
        return res.status(403).json({ message: 'Access denied. Regulatory authority role required.' });
    }
    next();
};

// POST /api/blockchain/mint - Mint new tokens (Producer only)
router.post('/mint', auth, requireProducer, async (req, res) => {
    try {
        const { factoryId, quantity = 1 } = req.body;

        if (!factoryId) {
            return res.status(400).json({ message: 'Factory ID is required' });
        }

        // For demo purposes, we'll use a fixed wallet address
        // In production, this would be the user's connected wallet
        const toAddress = process.env.DEFAULT_WALLET_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

        const mintedTokens = [];
        const failedMints = [];

        // Mint the specified quantity of tokens
        for (let i = 0; i < quantity; i++) {
            const result = await blockchainService.mintToken(toAddress, factoryId);

            if (result.success) {
                mintedTokens.push(result);

                // Save transaction to database only if we have valid data
                if (result.transactionHash && result.tokenId) {
                    try {
                        await Transaction.findOneAndUpdate(
                            { transactionHash: result.transactionHash }, // match by hash
                            {
                                transactionHash: result.transactionHash,
                                type: 'mint', // or 'transfer' / 'retire'
                                tokenId: result.tokenId,
                                from: result.from || null,
                                to: result.to || null,
                                factoryId: result.factoryId || null,
                                userId: req.user.id || null,
                                gasUsed: result.gasUsed || null,
                                blockNumber: result.blockNumber || null,
                                timestamp: new Date()
                            },
                            { upsert: true, new: true }
                        );

                    } catch (dbError) {
                        console.error('Database save error:', dbError);
                        // Continue with the response even if DB save fails
                    }
                }
            } else {
                failedMints.push(result.error);
            }
        }

        res.json({
            success: true,
            message: `Successfully minted ${mintedTokens.length} tokens`,
            mintedTokens,
            failedMints: failedMints.length > 0 ? failedMints : undefined
        });
    } catch (error) {
        console.error('Mint error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// POST /api/blockchain/transfer - Transfer token
router.post('/transfer', auth, async (req, res) => {
    try {
        const { tokenId, to } = req.body;

        if (!tokenId || !to) {
            return res.status(400).json({ message: 'Token ID and recipient address are required' });
        }

        // For demo purposes, using fixed addresses
        const from = process.env.DEFAULT_WALLET_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

        const result = await blockchainService.transferToken(from, to, tokenId);

        if (result.success) {
            // Save transaction to database only if we have valid data
            if (result.transactionHash) {
                try {
                    await new Transaction({
                        transactionHash: result.transactionHash,
                        type: 'transfer',
                        tokenId: tokenId,
                        from: from,
                        to: to,
                        userId: req.user.id,
                        gasUsed: result.gasUsed
                    }).save();
                } catch (dbError) {
                    console.error('Database save error:', dbError);
                    // Continue with the response even if DB save fails
                }
            }

            res.json({
                success: true,
                message: 'Token transferred successfully',
                transactionHash: result.transactionHash
            });
        } else {
            res.status(400).json({ message: 'Transfer failed', error: result.error });
        }
    } catch (error) {
        console.error('Transfer error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// POST /api/blockchain/retire - Retire token
router.post('/retire', auth, async (req, res) => {
    try {
        const { tokenId } = req.body;

        if (!tokenId) {
            return res.status(400).json({ message: 'Token ID is required' });
        }

        const result = await blockchainService.retireToken(tokenId);

        if (result.success) {
            // Save transaction to database only if we have valid data
            if (result.transactionHash) {
                try {
                    await new Transaction({
                        transactionHash: result.transactionHash,
                        type: 'retire',
                        tokenId: tokenId,
                        userId: req.user.id,
                        gasUsed: result.gasUsed
                    }).save();
                } catch (dbError) {
                    console.error('Database save error:', dbError);
                    // Continue with the response even if DB save fails
                }
            }

            res.json({
                success: true,
                message: 'Token retired successfully',
                transactionHash: result.transactionHash
            });
        } else {
            res.status(400).json({ message: 'Retirement failed', error: result.error });
        }
    } catch (error) {
        console.error('Retire error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// GET /api/blockchain/tokens - Get tokens by role
router.get('/tokens', auth, async (req, res) => {
    try {
        const userRole = req.user.role;

        if (userRole === 'Regulatory Authority' || userRole === 'Certification Body') {
            // Admin view - get all tokens with metadata
            const result = await blockchainService.getAllTokensWithMetadata();

            if (result.success) {
                // Also get transaction history from database
                const transactions = await Transaction.find({})
                    .populate('userId', 'username email')
                    .sort({ timestamp: -1 });

                res.json({
                    success: true,
                    tokens: result.tokens,
                    transactions: transactions
                });
            } else {
                res.status(500).json({ message: 'Failed to fetch tokens', error: result.error });
            }
        } else if (userRole === 'Green Hydrogen Producer') {
            // Producer view - get tokens they created
            const allTokensResult = await blockchainService.getAllTokensWithMetadata();

            if (allTokensResult.success) {
                const userAddress = process.env.DEFAULT_WALLET_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
                const userTokens = allTokensResult.tokens.filter(token =>
                    token.creator.toLowerCase() === userAddress.toLowerCase()
                );

                res.json({
                    success: true,
                    tokens: userTokens
                });
            } else {
                res.status(500).json({ message: 'Failed to fetch tokens', error: allTokensResult.error });
            }
        } else if (userRole === 'Industry Buyer') {
            // Buyer view - get tokens they own
            const userAddress = process.env.DEFAULT_WALLET_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
            const ownedTokensResult = await blockchainService.getTokensByOwner(userAddress);

            if (ownedTokensResult.success) {
                const tokensWithMetadata = [];
                for (const tokenId of ownedTokensResult.tokenIds) {
                    const metadataResult = await blockchainService.getTokenMetadata(tokenId);
                    if (metadataResult.success) {
                        tokensWithMetadata.push({
                            tokenId,
                            ...metadataResult.metadata
                        });
                    }
                }

                res.json({
                    success: true,
                    tokens: tokensWithMetadata
                });
            } else {
                res.status(500).json({ message: 'Failed to fetch tokens', error: ownedTokensResult.error });
            }
        } else {
            res.status(403).json({ message: 'Invalid role' });
        }
    } catch (error) {
        console.error('Get tokens error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// GET /api/blockchain/token/:id - Get specific token metadata
router.get('/token/:id', auth, async (req, res) => {
    try {
        const tokenId = req.params.id;
        const result = await blockchainService.getTokenMetadata(tokenId);

        if (result.success) {
            res.json({
                success: true,
                token: {
                    tokenId,
                    ...result.metadata
                }
            });
        } else {
            res.status(404).json({ message: 'Token not found', error: result.error });
        }
    } catch (error) {
        console.error('Get token metadata error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// GET /api/blockchain/stats - Get blockchain statistics (Admin only)
router.get('/stats', auth, requireAdmin, async (req, res) => {
    try {
        const totalTokensResult = await blockchainService.getTotalTokens();
        const retiredTokensResult = await blockchainService.getRetiredTokens();
        const allTokensResult = await blockchainService.getAllTokensWithMetadata();

        if (totalTokensResult.success && retiredTokensResult.success && allTokensResult.success) {
            const activeTokens = allTokensResult.tokens.filter(token => !token.isRetired);
            const transferredTokens = allTokensResult.tokens.filter(token =>
                token.creator.toLowerCase() !== token.currentOwner.toLowerCase()
            );

            const stats = {
                totalMinted: parseInt(totalTokensResult.total),
                totalRetired: retiredTokensResult.tokenIds.length,
                totalActive: activeTokens.length,
                totalTransferred: transferredTokens.length,
                totalTransactions: await Transaction.countDocuments()
            };

            res.json({
                success: true,
                stats
            });
        } else {
            res.status(500).json({ message: 'Failed to fetch statistics' });
        }
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// GET /api/blockchain/transactions - Get transaction history (Admin only)
router.get('/transactions', auth, requireAdmin, async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const transactions = await Transaction.find({})
            .populate('userId', 'username email role')
            .sort({ timestamp: -1 })
            .skip(skip)
            .limit(limit);

        const totalTransactions = await Transaction.countDocuments();

        res.json({
            success: true,
            transactions,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(totalTransactions / limit),
                totalTransactions,
                hasNext: page * limit < totalTransactions,
                hasPrev: page > 1
            }
        });
    } catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

module.exports = router;
