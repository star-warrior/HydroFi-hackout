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
                        await new Transaction({
                            transactionHash: result.transactionHash,
                            type: 'mint',
                            tokenId: result.tokenId,
                            to: toAddress,
                            factoryId: factoryId,
                            userId: req.user.id,
                            gasUsed: result.gasUsed
                        }).save();
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

// GET /api/blockchain/tokens - Get tokens by role with enhanced features
router.get('/tokens', auth, async (req, res) => {
    try {
        const userRole = req.user.role;
        const { page = 1, limit = 20, search, factoryId, owner, status } = req.query;

        if (userRole === 'Regulatory Authority' || userRole === 'Certification Body') {
            // Admin view with search and filtering capabilities
            let result;

            if (search || factoryId || owner || status) {
                // Use search functionality
                const filters = {};
                if (factoryId) filters.factoryId = factoryId;
                if (owner) filters.owner = owner;
                if (status) filters.status = status;

                result = await blockchainService.searchTokens(filters);
            } else {
                // Use pagination for all tokens
                const offset = (parseInt(page) - 1) * parseInt(limit);
                result = await blockchainService.getPaginatedTokensWithDetails(offset, parseInt(limit));
            }

            if (result.success) {
                // Enhance tokens with factory names
                const User = require('../models/User');
                const enhancedTokens = await Promise.all(
                    result.tokens.map(async (token) => {
                        try {
                            const producer = await User.findOne({
                                factoryId: token.metadata.factoryId,
                                role: 'Green Hydrogen Producer'
                            });
                            return {
                                ...token,
                                factoryName: producer ? producer.factoryName : 'Unknown'
                            };
                        } catch (error) {
                            return {
                                ...token,
                                factoryName: 'Unknown'
                            };
                        }
                    })
                );

                // Also get transaction history from database
                const transactions = await Transaction.find({})
                    .populate('userId', 'username email')
                    .sort({ timestamp: -1 })
                    .limit(100);

                res.json({
                    success: true,
                    tokens: enhancedTokens,
                    totalCount: result.totalCount || enhancedTokens.length,
                    page: parseInt(page),
                    limit: parseInt(limit),
                    transactions: transactions
                });
            } else {
                res.status(500).json({ message: 'Failed to fetch tokens', error: result.error });
            }
        } else if (userRole === 'Green Hydrogen Producer') {
            // Producer view - get tokens they created (using their factoryId)
            const userFactoryId = req.user.factoryId;

            if (!userFactoryId) {
                return res.status(400).json({ message: 'Factory ID not found for user' });
            }

            const result = await blockchainService.getTokensByFactory(userFactoryId);

            if (result.success) {
                const tokensWithDetails = [];
                for (const tokenId of result.tokenIds) {
                    const detailsResult = await blockchainService.getTokenDetails(tokenId);
                    if (detailsResult.success) {
                        tokensWithDetails.push({
                            tokenId,
                            ...detailsResult.tokenDetails,
                            factoryName: req.user.factoryName
                        });
                    }
                }

                res.json({
                    success: true,
                    tokens: tokensWithDetails
                });
            } else {
                res.status(500).json({ message: 'Failed to fetch tokens', error: result.error });
            }
        } else if (userRole === 'Industry Buyer') {
            // Buyer view - get tokens they own
            const userAddress = process.env.DEFAULT_WALLET_ADDRESS || '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
            const ownedTokensResult = await blockchainService.getTokensByOwner(userAddress);

            if (ownedTokensResult.success) {
                const tokensWithDetails = [];
                const User = require('../models/User');

                for (const tokenId of ownedTokensResult.tokenIds) {
                    const detailsResult = await blockchainService.getTokenDetails(tokenId);
                    if (detailsResult.success) {
                        try {
                            const producer = await User.findOne({
                                factoryId: detailsResult.tokenDetails.metadata.factoryId,
                                role: 'Green Hydrogen Producer'
                            });
                            tokensWithDetails.push({
                                tokenId,
                                ...detailsResult.tokenDetails,
                                factoryName: producer ? producer.factoryName : 'Unknown'
                            });
                        } catch (error) {
                            tokensWithDetails.push({
                                tokenId,
                                ...detailsResult.tokenDetails,
                                factoryName: 'Unknown'
                            });
                        }
                    }
                }

                res.json({
                    success: true,
                    tokens: tokensWithDetails
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

// GET /api/blockchain/token/:id - Get specific token with full details and history
router.get('/token/:id', auth, async (req, res) => {
    try {
        const tokenId = req.params.id;
        const result = await blockchainService.getTokenDetails(tokenId);

        if (result.success) {
            // Get factory name from database if available
            const User = require('../models/User');
            let factoryName = null;

            try {
                const producer = await User.findOne({
                    factoryId: result.tokenDetails.metadata.factoryId,
                    role: 'Green Hydrogen Producer'
                });
                if (producer) {
                    factoryName = producer.factoryName;
                }
            } catch (dbError) {
                console.warn('Could not fetch factory name:', dbError.message);
            }

            res.json({
                success: true,
                token: {
                    tokenId,
                    ...result.tokenDetails,
                    factoryName
                }
            });
        } else {
            res.status(404).json({ message: 'Token not found', error: result.error });
        }
    } catch (error) {
        console.error('Get token details error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// GET /api/blockchain/token/:id/history - Get token ownership history
router.get('/token/:id/history', auth, async (req, res) => {
    try {
        const tokenId = req.params.id;
        const result = await blockchainService.getOwnershipHistory(tokenId);

        if (result.success) {
            res.json({
                success: true,
                tokenId,
                history: result.history
            });
        } else {
            res.status(404).json({ message: 'Token history not found', error: result.error });
        }
    } catch (error) {
        console.error('Get token history error:', error);
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

// GET /api/blockchain/factories - Get all factory information for admin filtering
router.get('/factories', auth, requireAdmin, async (req, res) => {
    try {
        const User = require('../models/User');
        const factories = await User.find({
            role: 'Green Hydrogen Producer',
            factoryId: { $exists: true, $ne: null }
        }).select('factoryId factoryName username');

        res.json({
            success: true,
            factories: factories.map(factory => ({
                factoryId: factory.factoryId,
                factoryName: factory.factoryName,
                producerName: factory.username
            }))
        });
    } catch (error) {
        console.error('Get factories error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

// GET /api/blockchain/search - Advanced search for tokens (Admin only)
router.get('/search', auth, requireAdmin, async (req, res) => {
    try {
        const {
            factoryName,
            factoryId,
            owner,
            status,
            startDate,
            endDate,
            page = 1,
            limit = 20
        } = req.query;

        // Build search filters
        const filters = {};
        if (factoryId) filters.factoryId = factoryId;
        if (owner) filters.owner = owner;
        if (status) filters.status = status;

        // If searching by factory name, first find the factoryId
        if (factoryName && !factoryId) {
            const User = require('../models/User');
            const producer = await User.findOne({
                factoryName: new RegExp(factoryName, 'i'),
                role: 'Green Hydrogen Producer'
            });
            if (producer) {
                filters.factoryId = producer.factoryId;
            } else {
                return res.json({
                    success: true,
                    tokens: [],
                    totalCount: 0,
                    message: 'No factory found with that name'
                });
            }
        }

        const result = await blockchainService.searchTokens(filters);

        if (result.success) {
            let filteredTokens = result.tokens;

            // Apply date filters if provided
            if (startDate || endDate) {
                filteredTokens = filteredTokens.filter(token => {
                    const tokenDate = new Date(token.metadata.creationTimestamp);
                    const start = startDate ? new Date(startDate) : new Date(0);
                    const end = endDate ? new Date(endDate) : new Date();
                    return tokenDate >= start && tokenDate <= end;
                });
            }

            // Apply pagination
            const offset = (parseInt(page) - 1) * parseInt(limit);
            const paginatedTokens = filteredTokens.slice(offset, offset + parseInt(limit));

            // Enhance with factory names
            const User = require('../models/User');
            const enhancedTokens = await Promise.all(
                paginatedTokens.map(async (token) => {
                    try {
                        const producer = await User.findOne({
                            factoryId: token.metadata.factoryId,
                            role: 'Green Hydrogen Producer'
                        });
                        return {
                            ...token,
                            factoryName: producer ? producer.factoryName : 'Unknown',
                            producerName: producer ? producer.username : 'Unknown'
                        };
                    } catch (error) {
                        return {
                            ...token,
                            factoryName: 'Unknown',
                            producerName: 'Unknown'
                        };
                    }
                })
            );

            res.json({
                success: true,
                tokens: enhancedTokens,
                totalCount: filteredTokens.length,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(filteredTokens.length / parseInt(limit))
            });
        } else {
            res.status(500).json({ message: 'Search failed', error: result.error });
        }
    } catch (error) {
        console.error('Search tokens error:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

module.exports = router;
