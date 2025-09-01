import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useBlockchain } from "../../contexts/BlockchainContext";
import { useAuth } from "../../contexts/AuthContext";

// --- MOCKED CONTEXTS & DATA ---
// To make this component self-contained, we'll mock the necessary hooks and data.
// In a real application, you would remove these and use your actual context providers.





// --- SVG ICONS (replaces react-icons) ---
const Icon = ({ className, children }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        {children}
    </svg>
);

const FiCreditCard = (props) => <Icon {...props}><rect x="1" y="4" width="22" height="16" rx="2" ry="2"></rect><line x1="1" y1="10" x2="23" y2="10"></line></Icon>;
const FiCheckCircle = (props) => <Icon {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></Icon>;
const FiDatabase = (props) => <Icon {...props}><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path></Icon>;
const FiDollarSign = (props) => <Icon {...props}><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></Icon>;
const FiSend = (props) => <Icon {...props}><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></Icon>;
const FiLoader = (props) => <Icon {...props}><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></Icon>;
const FiTrendingUp = (props) => <Icon {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></Icon>;
const FiTrendingDown = (props) => <Icon {...props}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></Icon>;


// --- REUSABLE UI COMPONENTS ---

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
                <h3 className="text-xl font-semibold text-white mb-4">{title}</h3>
                <div className="text-slate-400 mb-6">{children}</div>
                <div className="flex justify-end space-x-4">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-red-500 hover:opacity-90 transition-opacity"
                    >
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon: IconComponent, description }) => (
    <div className="bg-gradient-to-br from-[#21312E] to-[#263834] border border-gray-700/50 rounded-xl p-5 shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.02] transition-all duration-300">
        <div className="flex justify-between items-center">
            <p className="text-sm text-gray-400">{title}</p>
            <IconComponent className="text-teal-400" size={24} />
        </div>
        <h3 className="text-4xl font-bold text-slate-100 mt-2 bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-400">{value}</h3>
        <p className="text-sm text-gray-400 mt-1 flex items-center">
            {description}
        </p>
    </div>
);

const Notification = ({ message, type, onDismiss }) => {
    if (!message) return null;

    const baseClasses = "mt-4 p-3 text-sm rounded-lg border flex items-center justify-between";
    const typeClasses = {
        success: "text-green-300 bg-green-500/10 border-green-500/30",
        error: "text-red-300 bg-red-500/10 border-red-500/30",
    };

    return (
        <div className={`${baseClasses} ${typeClasses[type]}`}>
            <span>{message}</span>
            <button onClick={onDismiss} className="ml-4 font-bold text-lg">&times;</button>
        </div>
    );
};


// --- MAIN BUYER DASHBOARD COMPONENT ---
const BuyerDashboard = () => {
    const [buyerData, setBuyerData] = useState(null);
    const [transferToAddress, setTransferToAddress] = useState("");
    const [selectedTokenId, setSelectedTokenId] = useState("");
    const [tokenToRetire, setTokenToRetire] = useState(null);
    const [notification, setNotification] = useState({ message: null, type: null });

    const { user } = useAuth();
    const { tokens, loading, fetchTokens, transferToken, retireToken } = useBlockchain();
    
    useEffect(() => {
        const fetchBuyerData = async () => {
            try {
                const mockData = {
                    marketPrices: [
                        { type: 'Solar-Powered', price: 88.50, change: '+1.2%' },
                        { type: 'Wind-Powered', price: 85.00, change: '-0.5%' },
                        { type: 'Geothermal', price: 92.75, change: '+2.1%' }
                    ]
                };
                setBuyerData(mockData);
            } catch (error) {
                console.error("Failed to fetch buyer data:", error);
                showNotification("Failed to fetch market data.", "error");
            }
        };

        fetchBuyerData();
        fetchTokens();
    }, [fetchTokens]);

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification({ message: null, type: null }), 5000);
    };

    const ownedTokens = useMemo(() => (tokens || []).filter(token => token && !token.isRetired && token.currentOwner === user?.walletAddress), [tokens, user?.walletAddress]);
    const retiredTokens = useMemo(() => (tokens || []).filter(token => token && token.isRetired && token.currentOwner === user?.walletAddress), [tokens, user?.walletAddress]);
    const portfolioValue = useMemo(() => (ownedTokens.length * 85).toLocaleString('en-US', { style: 'currency', currency: 'USD' }), [ownedTokens]);


    const handleTransferToken = async (e) => {
        e.preventDefault();
        if (!selectedTokenId || !transferToAddress.trim()) {
            showNotification("Please select a token and enter a recipient address.", "error");
            return;
        }

        try {
            await transferToken(selectedTokenId, transferToAddress);
            showNotification("Token transferred successfully!", "success");
            setSelectedTokenId("");
            setTransferToAddress("");
            fetchTokens(); // Refreshes the local state
        } catch (err) {
            console.error("Transfer failed:", err);
            showNotification(err.message || "Transfer failed.", "error");
        }
    };

    const initiateRetireToken = (tokenId) => {
        setTokenToRetire(tokenId);
    };

    const confirmRetireToken = async () => {
        if (!tokenToRetire) return;

        try {
            await retireToken(tokenToRetire);
            showNotification("Token retired successfully!", "success");
            fetchTokens(); // Refreshes the local state
        } catch (err) {
            console.error("Retirement failed:", err);
            showNotification(err.message || "Retirement failed.", "error");
        } finally {
            setTokenToRetire(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1A2421] to-[#1F2C28] text-gray-300 font-sans p-8">
            <ConfirmationModal
                isOpen={!!tokenToRetire}
                onClose={() => setTokenToRetire(null)}
                onConfirm={confirmRetireToken}
                title="Confirm Token Retirement"
            >
                <p>Are you sure you want to retire Token #{tokenToRetire}? This action is irreversible and will permanently remove the credit from circulation.</p>
            </ConfirmationModal>

            <h2 className="text-2xl font-semibold text-white mb-2">Buyer Dashboard</h2>
            <p className="text-md text-gray-400 mb-8">Manage your portfolio of green hydrogen credits.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="Owned Credits" value={ownedTokens.length} icon={FiCreditCard} description="Active credits in your wallet" />
                <StatCard title="Retired Credits" value={retiredTokens.length} icon={FiCheckCircle} description="Credits you have retired" />
                <StatCard title="Total Credits" value={(ownedTokens.length + retiredTokens.length)} icon={FiDatabase} description="All credits you've interacted with" />
                <StatCard title="Portfolio Value" value={portfolioValue} icon={FiDollarSign} description="Estimated value of owned credits" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-[#21312E]/50 border border-gray-700/50 rounded-xl shadow-xl">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">My Credits ({ownedTokens.length})</h3>
                            <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                                {loading ? <div className="text-center p-4">Loading credits...</div> :
                                 ownedTokens.length > 0 ? ownedTokens.map(token => (
                                    <div key={token.tokenId} className="border border-gray-700 rounded-lg p-4 bg-slate-800/50 flex justify-between items-start">
                                        <div className="text-sm text-gray-300">
                                            <strong className="text-slate-100">Token #{token.tokenId}</strong>
                                            <p>Factory: {token.factoryId}</p>
                                            <p>Minted: {new Date(token.creationTimestamp).toLocaleDateString()}</p>
                                        </div>
                                        <button onClick={() => initiateRetireToken(token.tokenId)}
                                            className="bg-gradient-to-r from-rose-600 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-md hover:opacity-90 transition disabled:opacity-50">
                                            Retire
                                        </button>
                                    </div>
                                )) : <p className="text-gray-400 text-center py-8">No active credits found.</p>}
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#21312E]/50 border border-gray-700/50 rounded-xl shadow-xl">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">My Retired Credits ({retiredTokens.length})</h3>
                             <div className="max-h-60 overflow-y-auto space-y-3 pr-2">
                                {loading ? <div className="text-center p-4">Loading...</div> :
                                 retiredTokens.length > 0 ? retiredTokens.map(token => (
                                    <div key={token.tokenId} className="border border-gray-800 rounded-lg p-3 bg-slate-900/60 text-sm text-gray-500">
                                        <strong className="text-slate-400">Token #{token.tokenId}</strong> from Factory {token.factoryId}
                                        <p>Retired On: {new Date(token.retirementTimestamp).toLocaleDateString()}</p>
                                    </div>
                                 )) : <p className="text-gray-500 text-center py-8">You have not retired any credits yet.</p>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-[#21312E]/50 border border-gray-700/50 rounded-xl shadow-xl">
                        <div className="p-6">
                             <h3 className="text-lg font-semibold text-white mb-4">Transfer Credit</h3>
                             <form onSubmit={handleTransferToken} className="space-y-4">
                                <div>
                                    <label htmlFor="tokenSelect" className="block text-sm font-medium text-gray-400 mb-2">Select Credit:</label>
                                    <select id="tokenSelect" value={selectedTokenId} onChange={(e) => setSelectedTokenId(e.target.value)} required
                                        className="w-full rounded-lg border-gray-600 bg-slate-800 text-slate-100 p-2 focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50">
                                        <option value="">Choose a token...</option>
                                        {ownedTokens.map((token) => (
                                            <option key={token.tokenId} value={token.tokenId}>
                                                Token #{token.tokenId} - (Factory: {token.factoryId})
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="transferAddress" className="block text-sm font-medium text-gray-400 mb-2">Recipient Address:</label>
                                    <input type="text" id="transferAddress" value={transferToAddress} onChange={(e) => setTransferToAddress(e.target.value)}
                                        placeholder="0x..." required
                                        className="w-full rounded-lg border-gray-600 bg-slate-800 text-slate-100 p-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
                                </div>
                                <button type="submit" disabled={loading || ownedTokens.length === 0}
                                    className="w-full flex justify-center items-center bg-gradient-to-r from-teal-600 to-green-500 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                    {loading ? <><FiLoader className="animate-spin mr-2" /> Processing...</> : <><FiSend className="mr-2"/> Transfer</>}
                                </button>
                             </form>
                             <Notification message={notification.message} type={notification.type} onDismiss={() => setNotification({ message: null, type: null })} />
                        </div>
                    </div>

                     <div className="bg-[#21312E]/50 border border-gray-700/50 rounded-xl shadow-xl">
                         <div className="p-6">
                            <h3 className="text-lg font-semibold text-white mb-4">Current Market Prices</h3>
                            <div className="space-y-3">
                                {(buyerData?.marketPrices || []).map((price, index) => (
                                    <div key={index} className="flex justify-between items-center text-sm p-3 bg-slate-800/50 rounded-lg">
                                        <div>
                                            <p className="font-semibold text-slate-300">{price.type}</p>
                                            <p className="text-slate-100 text-lg font-mono">${price.price.toFixed(2)}</p>
                                        </div>
                                        <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${price.change.startsWith('+') ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                                            {price.change.startsWith('+') ? <FiTrendingUp className="mr-1" /> : <FiTrendingDown className="mr-1" />}
                                            {price.change}
                                        </div>
                                    </div>
                                ))}
                            </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BuyerDashboard;

