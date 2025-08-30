const mongoose = require('mongoose');
const { ethers } = require('ethers');
require('dotenv').config();

const User = require('./models/User');

async function migrateWallets() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hydrofi', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        console.log('Connected to MongoDB');

        // Find all users without wallet addresses
        const usersWithoutWallets = await User.find({ walletAddress: { $exists: false } });
        console.log(`Found ${usersWithoutWallets.length} users without wallet addresses`);

        // Generate wallet addresses for each user
        for (const user of usersWithoutWallets) {
            const wallet = ethers.Wallet.createRandom();
            user.walletAddress = wallet.address;
            await user.save();
            console.log(`Added wallet ${wallet.address} for user ${user.username}`);
        }

        console.log('Migration completed successfully');
        process.exit(0);
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrateWallets();
