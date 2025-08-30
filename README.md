# HydroFi - Green Hydrogen Credit System

A full-stack MERN application for managing green hydrogen production, certification, and carbon credit trading.

## Features

- **User Authentication**: Secure JWT-based authentication with role-based access
- **Role-Based Dashboards**: Different interfaces for each user type
- **Blockchain Integration**: ERC-1155 smart contracts for green hydrogen credits
- **Token Management**: Mint, transfer, and retire carbon credits
- **Real-time Data**: Dynamic dashboard content based on user roles
- **Transfer by Identifier**: Transfer tokens using username or factory ID
- **Audit Trail**: Complete transaction history and ownership tracking
- **Responsive Design**: Modern UI that works across devices

## Blockchain Features

- **ERC-1155 Multi-Token Standard**: Efficient batch operations and metadata support
- **Green Hydrogen Credits**: Each token represents verified green hydrogen production
- **Ownership Tracking**: Complete history of token creation, transfers, and retirement
- **Factory-Based Minting**: Tokens linked to specific production facilities
- **Pausable Contract**: Emergency stop functionality for regulatory compliance
- **Metadata Storage**: Rich token information including production details

## User Roles

1. **Green Hydrogen Producer**: Manage production facilities and mint carbon credits
2. **Regulatory Authority**: Oversee compliance, audit transactions, and advanced search
3. **Industry Buyer**: Purchase and manage carbon credit portfolios
4. **Certification Body**: Conduct inspections and issue certifications

## Technology Stack

### Backend

- Node.js with Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

### Frontend

- React 18 with Vite
- React Router for navigation
- Axios for API calls
- Context API for state management

## Installation and Setup

### Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Blockchain/Smart Contract Setup

1. Navigate to the contracts directory:

   ```bash
   cd contracts
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the contracts directory with the following variables:

   ```env
   PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   # This is a default Hardhat test private key - change for production
   ```

4. Start the Hardhat local blockchain network:

   ```bash
   npx hardhat node
   ```

   This will:
   - Start a local Ethereum blockchain on `http://localhost:8545`
   - Create 20 test accounts with 10,000 ETH each
   - Display account addresses and private keys for testing

5. In a new terminal, deploy the smart contract:

   ```bash
   cd contracts
   npx hardhat run scripts/deploy.js --network localhost
   ```

   This will:
   - Deploy the `GreenHydrogenCredits` ERC-1155 contract
   - Save contract data to `../backend/contract-data.json`
   - Display the deployed contract address

6. (Optional) List available accounts:

   ```bash
   npx hardhat run scripts/list-accounts.js --network localhost
   ```

### Backend Setup

1. Navigate to the backend directory:

   ```bash
   cd backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:

   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/hydrofi_db
   JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
   BLOCKCHAIN_RPC_URL=http://localhost:8545
   WALLET_PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   DEFAULT_WALLET_ADDRESS=0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
   ```

4. Run the wallet migration script (if you have existing users):

   ```bash
   node migrate-wallets.js
   ```

5. Start the backend server:

   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at:

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:5000>
- Blockchain: <http://localhost:8545>

## Troubleshooting

### Common Issues

1. **Contract deployment fails**:
   - Ensure Hardhat node is running (`npx hardhat node`)
   - Check that port 8545 is not occupied by another process
   - Verify the private key in `.env` matches a Hardhat test account

2. **Backend can't connect to blockchain**:
   - Verify `BLOCKCHAIN_RPC_URL=http://localhost:8545` in backend `.env`
   - Ensure contract is deployed and `contract-data.json` exists
   - Check that the Hardhat node is still running

3. **Tokens not appearing after minting**:
   - Check browser console for errors
   - Verify user has unique wallet address (run migration script)
   - Ensure smart contract events are being emitted

4. **Transfer fails**:
   - Verify recipient exists in the system
   - Check that token is owned by the sender
   - Ensure blockchain connection is stable

### Setup Verification

After completing setup, verify everything works:

1. **Check Hardhat node**: Should show mining activity when transactions occur
2. **Test contract deployment**: Contract address should appear in console
3. **Verify backend connection**: Check logs for "Blockchain service initialized successfully"
4. **Test frontend**: Registration and login should work without errors

### Development Commands

```bash
# Reset blockchain (clears all data)
cd contracts
npx hardhat clean
npx hardhat node

# Redeploy contract
npx hardhat run scripts/deploy.js --network localhost

# Check accounts
npx hardhat run scripts/list-accounts.js --network localhost
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Dashboard

- `GET /api/dashboard/data` - Get role-based dashboard data (protected)
- `GET /api/dashboard/producer` - Get producer-specific data (protected)
- `GET /api/dashboard/regulatory` - Get regulatory data (protected)
- `GET /api/dashboard/buyer` - Get buyer data (protected)
- `GET /api/dashboard/certification` - Get certification data (protected)

## Usage

1. **Registration**: Create an account by selecting your role and providing credentials
2. **Login**: Access your role-specific dashboard
3. **Dashboard**: View relevant data and perform actions based on your role
4. **Navigation**: Use the navbar to switch between pages and logout

## Project Structure

```text
HydroFi_Final/
├── backend/
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   └── Transaction.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── dashboard.js
│   │   └── blockchain.js
│   ├── services/
│   │   └── blockchainService.js
│   ├── contract-data.json
│   ├── migrate-wallets.js
│   ├── .env
│   ├── package.json
│   └── server.js
├── contracts/
│   ├── contracts/
│   │   └── GreenHydrogenCredits.sol
│   ├── scripts/
│   │   ├── deploy.js
│   │   └── list-accounts.js
│   ├── artifacts/
│   ├── cache/
│   ├── .env
│   ├── hardhat.config.js
│   └── package.json
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── auth/
    │   │   ├── dashboards/
    │   │   ├── EnhancedTransferComponent.jsx
    │   │   ├── WalletHelper.jsx
    │   │   ├── Home.jsx
    │   │   └── Navbar.jsx
    │   ├── contexts/
    │   │   ├── AuthContext.jsx
    │   │   └── BlockchainContext.jsx
    │   ├── App.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── package.json
    └── vite.config.js
```

## Security Features

- Password hashing with bcryptjs
- JWT-based stateless authentication
- Role-based route protection
- Input validation and sanitization
- CORS configuration

## Future Enhancements

- Real blockchain integration
- Advanced analytics and reporting
- Real-time notifications
- File upload for certificates
- Advanced search and filtering
- Email verification
- Password reset functionality

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.
