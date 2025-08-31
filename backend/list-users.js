const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function listUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/hydrofi_db');
        console.log('Connected to MongoDB');

        // Get all users
        const users = await User.find({}).select('username email role factoryName factoryId walletAddress');

        console.log('\n=== ALL USERS IN DATABASE ===\n');

        if (users.length === 0) {
            console.log('No users found in database');
        } else {
            users.forEach((user, index) => {
                console.log(`${index + 1}. User ID: ${user._id}`);
                console.log(`   Username: ${user.username}`);
                console.log(`   Email: ${user.email}`);
                console.log(`   Role: ${user.role}`);
                console.log(`   Wallet Address: ${user.walletAddress || 'Not set'}`);
                if (user.factoryName) {
                    console.log(`   Factory Name: ${user.factoryName}`);
                    console.log(`   Factory ID: ${user.factoryId}`);
                }
                console.log('---');
            });
        }

        // Filter Industry Buyers specifically
        const buyers = users.filter(user => user.role === 'Industry Buyer');
        console.log('\n=== INDUSTRY BUYERS ===\n');

        if (buyers.length === 0) {
            console.log('❌ No Industry Buyers found in database');
            console.log('\n💡 To create an Industry Buyer:');
            console.log('1. Go to the frontend registration page');
            console.log('2. Select "Industry Buyer" as the role');
            console.log('3. Fill in the registration form');
            console.log('4. Or create one manually using the API');
        } else {
            buyers.forEach((buyer, index) => {
                console.log(`${index + 1}. Industry Buyer`);
                console.log(`   User ID: ${buyer._id}`);
                console.log(`   Username: ${buyer.username}`);
                console.log(`   Email: ${buyer.email}`);
                console.log(`   Wallet Address: ${buyer.walletAddress}`);
                console.log('---');
            });
        }

        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listUsers();
