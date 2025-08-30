// Transaction schema for MongoDB, all fields should be dynamic and not hardcoded

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
    transactionHash: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        enum: ['mint', 'transfer', 'retire'],
        required: true
    },
    tokenId: {
        type: String,
        required: true
    },
    from: {
        type: String,
        default: null
    },
    to: {
        type: String,
        default: null
    },
    factoryId: {
        type: String,
        default: null
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    blockNumber: {
        type: Number,
        default: null
    },
    gasUsed: {
        type: String,
        default: null
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Index for efficient queries
transactionSchema.index({ type: 1, timestamp: -1 });
transactionSchema.index({ tokenId: 1 });
transactionSchema.index({ from: 1 });
transactionSchema.index({ to: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
