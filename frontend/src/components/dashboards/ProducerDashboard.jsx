import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useBlockchain } from "../../contexts/BlockchainContext";
import WalletHelper from "../WalletHelper";
import EnhancedTransferComponent from "../EnhancedTransferComponent";
import { FiTrendingUp, FiTrendingDown, FiArrowRight, FiHome, FiCreditCard, FiSend, FiArchive, FiSettings, FiLogOut, FiBarChart2, FiDatabase } from "react-icons/fi";
import { FaIndustry } from "react-icons/fa";
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
const NavItem = ({ icon: Icon, label, navName, activeNav, setActiveNav }) => (
    <button
      onClick={() => setActiveNav(navName)}
      className={`flex items-center w-full px-4 py-2.5 text-sm rounded-lg transition-colors group relative ${activeNav === navName 
        ? 'font-semibold text-white bg-teal-500/10' 
        : 'text-gray-400 hover:bg-gray-800/50'}`}
    >
      {activeNav === navName && <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-teal-500 rounded-r-full"></div>}
      <Icon className={`mr-3 transition-colors ${activeNav === navName ? 'text-teal-400' : 'text-gray-500 group-hover:text-gray-300'}`} />
      {label}
    </button>
);
const StatCard = ({ title, value, change, changeType, description }) => (
    <div className="bg-gradient-to-br from-[#21312E] to-[#263834] border border-gray-700/50 rounded-xl p-5 shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.02] transition-all duration-300">
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-400">{title}</p>
        {change && (
          <div className={`flex items-center text-xs font-semibold px-2 py-1 rounded-full ${changeType === 'positive' ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
            {changeType === 'positive' ? <FiTrendingUp className="mr-1" /> : <FiTrendingDown className="mr-1" />}
            {change}
          </div>
        )}
      </div>
      <h3 className="text-4xl font-bold text-slate-100 mt-2 bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-400">{value}</h3>
      <p className="text-sm text-gray-400 mt-1 flex items-center">
        {description}
      </p>
    </div>
);
const TabButton = ({ label, tabName, activeMainTab, setActiveMainTab }) => (
    <button
      onClick={() => setActiveMainTab(tabName)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 relative ${activeMainTab === tabName 
        ? 'text-white' 
        : 'text-gray-400 hover:bg-slate-800/50 hover:text-white'}`}
    >
      {activeMainTab === tabName && 
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></span>
      }
      {label}
    </button>
);

// A placeholder component for the chart. Replace with your actual charting library.
const PlaceholderChart = () => (
  <div className="h-64 w-full flex items-center justify-center bg-slate-900/50 rounded-lg">
    <p className="text-slate-500">Chart data will be displayed here</p>
  </div>
);

const ProducerDashboard = () => {
    const [producerData, setProducerData] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [mintingSuccess, setMintingSuccess] = useState(null);
    const [transferData, setTransferData] = useState({ tokenId: "", recipientAddress: "" });
    const [transferSuccess, setTransferSuccess] = useState(null);
    const [transferError, setTransferError] = useState(null);
    const [transferMethod, setTransferMethod] = useState("identifier");
    
    const [retiringTokenId, setRetiringTokenId] = useState(null); // Tracks which token is in the process of retiring
    const [tokenToConfirmRetire, setTokenToConfirmRetire] = useState(null); // Tracks which token is in the confirmation modal

    const [activeMainTab, setActiveMainTab] = useState("generate");
    const [activeNav, setActiveNav] = useState("dashboard");

    const { user, logout } = useAuth();
    const { tokens, loading, error, mintTokens, fetchTokens, retireToken } = useBlockchain();

    useEffect(() => {
        const fetchProducerData = async () => {
          try {
            // Mocking API call for producer data
            const mockData = { 
                productionFacilities: [
                    { id: 'F001', name: 'HydroGreen Plant Alpha', capacity: '500 MW', status: 'Active' },
                    { id: 'F002', name: 'HydroGreen Plant Beta', capacity: '750 MW', status: 'Active' },
                ]
            };
            setProducerData(mockData);
          } catch (err) {
            console.error("Failed to fetch producer data:", err);
          }
        };

        fetchProducerData();
        fetchTokens();
    }, [fetchTokens]);
    
    // Derived state with useMemo for performance
    const { userTokens, retiredTokens, soldCreditsCount } = useMemo(() => {
        const safeTokens = Array.isArray(tokens) ? tokens : [];
        const baseWalletAddress = user?.walletAddress;

        const userTokens = safeTokens.filter(token => token && !token.isRetired && token.currentOwner === baseWalletAddress);
        const retiredTokens = safeTokens.filter(token => token && token.isRetired);
        const soldCreditsCount = safeTokens.filter(token => token && token.creator === baseWalletAddress && token.currentOwner !== baseWalletAddress).length;
        
        return { userTokens, retiredTokens, soldCreditsCount };
    }, [tokens, user?.walletAddress]);


    const handleMintTokens = async (e) => {
        e.preventDefault();
        if (!user?.factoryId) {
            // Replace alert with a more modern notification system in a real app
            console.error("Factory ID not found. Please contact admin.");
            return;
        }

        try {
            const result = await mintTokens(user.factoryId, quantity);
            const mintedCount = result?.mintedTokens?.length ?? 0;
            setMintingSuccess(`Successfully minted ${mintedCount} token${mintedCount === 1 ? "" : "s"}!`);
            setQuantity(1);
            setTimeout(() => setMintingSuccess(null), 5000);
        } catch (err) {
            console.error("Minting failed:", err);
        }
    };

    const initiateRetireToken = (tokenId) => {
        setTokenToConfirmRetire(tokenId);
    };

    const confirmRetireToken = async () => {
        if (!tokenToConfirmRetire) return;

        setRetiringTokenId(tokenToConfirmRetire);
        setTokenToConfirmRetire(null); // Close modal
        try {
            await retireToken(tokenToConfirmRetire);
            // In a real app, you'd show a success toast here instead of an alert
            console.log("Token retired successfully!");
            await fetchTokens(); // Refresh data
        } catch (err) {
            console.error("Retirement failed:", err);
        } finally {
            setRetiringTokenId(null);
        }
    };
    
    // ... other handlers like handleTransferToken would go here ...
    
    return (
        <div className="flex h-screen bg-gradient-to-br from-[#1A2421] to-[#1F2C28] text-gray-300 font-sans">
            <ConfirmationModal
                isOpen={!!tokenToConfirmRetire}
                onClose={() => setTokenToConfirmRetire(null)}
                onConfirm={confirmRetireToken}
                title="Confirm Token Retirement"
            >
                <p>Are you sure you want to retire Token #{tokenToConfirmRetire}? This action is irreversible and will permanently remove the credit from circulation.</p>
            </ConfirmationModal>

            {/* Sidebar */}
            <aside className="w-64 flex-shrink-0 bg-[#111827]/50 flex flex-col p-4 border-r border-gray-800">
                <div className="flex items-center mb-8 p-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-cyan-400 flex items-center justify-center mr-3 shadow-lg">
                        <FiBarChart2 className="text-white" />
                    </div>
                    <h1 className="text-xl font-bold text-white">HydroCredit</h1>
                </div>
                
                <nav className="flex-1 space-y-2">
                    <NavItem icon={FiHome} label="Dashboard" navName="dashboard" activeNav={activeNav} setActiveNav={setActiveNav} />
                    <NavItem icon={FiDatabase} label="Production Data" navName="production" activeNav={activeNav} setActiveNav={setActiveNav}/>
                    <NavItem icon={FiCreditCard} label="Credits" navName="credits" activeNav={activeNav} setActiveNav={setActiveNav}/>
                    <NavItem icon={FiSend} label="Transactions" navName="transactions" activeNav={activeNav} setActiveNav={setActiveNav}/>
                    <NavItem icon={FaIndustry} label="Facilities" navName="facilities" activeNav={activeNav} setActiveNav={setActiveNav}/>
                    <NavItem icon={FiArchive} label="Archive" navName="archive" activeNav={activeNav} setActiveNav={setActiveNav}/>
                </nav>
                
                <div className="mt-auto pt-4 border-t border-gray-800 space-y-2">
                    <NavItem icon={FiSettings} label="Settings" navName="settings" activeNav={activeNav} setActiveNav={setActiveNav}/>
                    <button 
                      onClick={logout}
                      className="flex items-center px-4 py-2.5 text-sm text-gray-400 hover:bg-gray-800/50 rounded-lg w-full group"
                    >
                      <FiLogOut className="mr-3 text-gray-500 group-hover:text-gray-300" />
                      Logout
                    </button>
                </div>
            </aside>
            
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <header className="h-20 flex-shrink-0 flex items-center justify-between px-8 border-b border-gray-800 bg-transparent">
                    <div>
                        <h2 className="text-xl font-semibold text-white">Producer Dashboard</h2>
                        <p className="text-sm text-gray-400">Welcome back, {user?.name}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <WalletHelper />
                    </div>
                </header>
                
                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <StatCard title="Active Credits" value={userTokens.length} change="+12.5%" changeType="positive" description="Credits available in wallet" />
                        <StatCard title="Total Minted" value={tokens.length} change="+4.5%" changeType="positive" description="All credits ever generated" />
                        <StatCard title="Sold Credits" value={soldCreditsCount} change="-5.2%" changeType="negative" description="Credits transferred out" />
                        <StatCard title="Retired Credits" value={retiredTokens.length} description="Credits permanently used" />
                    </div>

                    <div className="bg-[#21312E]/50 border border-gray-700/50 rounded-xl mb-8 shadow-xl">
                        <div className="flex flex-wrap justify-between items-center p-6 border-b border-gray-700/50">
                            <div>
                                <h3 className="text-xl font-semibold text-white">Credit Activity</h3>
                                <p className="text-sm text-gray-400 mt-1">Total credits minted, sold, and retired over time.</p>
                            </div>
                            <div className="flex items-center space-x-2 bg-slate-800/80 p-1 rounded-lg mt-4 sm:mt-0">
                                <button className="px-3 py-1 text-sm text-gray-300 rounded-md hover:bg-slate-700">7D</button>
                                <button className="px-3 py-1 text-sm text-white bg-slate-700 rounded-md">30D</button>
                                <button className="px-3 py-1 text-sm text-gray-300 rounded-md hover:bg-slate-700">3M</button>
                            </div>
                        </div>
                        <div className="p-6">
                            <PlaceholderChart />
                        </div>
                    </div>

                    <div className="bg-[#21312E]/50 border border-gray-700/50 rounded-xl shadow-xl">
                        <div className="p-2 border-b border-gray-700/50 flex items-center space-x-2">
                           <TabButton label="Generate Credits" tabName="generate" activeMainTab={activeMainTab} setActiveMainTab={setActiveMainTab} />
                           <TabButton label="Transfer Credits" tabName="transfer" activeMainTab={activeMainTab} setActiveMainTab={setActiveMainTab} />
                           <TabButton label="My Active Credits" tabName="active" activeMainTab={activeMainTab} setActiveMainTab={setActiveMainTab} />
                           <TabButton label="Production Facilities" tabName="facilities" activeMainTab={activeMainTab} setActiveMainTab={setActiveMainTab} />
                           <TabButton label="Retired Credits" tabName="retired" activeMainTab={activeMainTab} setActiveMainTab={setActiveMainTab} />
                        </div>
                        <div className="p-6 min-h-[300px]">
                            {/* Render content based on active tab */}
                             {activeMainTab === 'generate' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Generate Green Hydrogen Credits</h3>
                                    {user?.factoryId && (
                                      <div className="text-gray-300 mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
                                        <strong>Factory:</strong> {user.factoryName} ({user.factoryId})
                                      </div>
                                    )}
                                    <form onSubmit={handleMintTokens} className="space-y-4">
                                      <div>
                                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-400 mb-2">Quantity (1-10):</label>
                                        <input type="number" id="quantity" value={quantity}
                                          onChange={(e) => setQuantity(Math.max(1, Math.min(10, parseInt(e.target.value, 10) || 1)))}
                                          min="1" max="10"
                                          className="w-full rounded-lg border-gray-600 bg-slate-800 text-slate-100 p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
                                        />
                                      </div>
                                      <button type="submit" disabled={loading || !user?.factoryId}
                                        className="w-full bg-gradient-to-r from-teal-600 to-green-500 text-white font-semibold py-2.5 px-6 rounded-lg shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                        {loading ? "Minting..." : `Generate ${quantity} Credit${quantity > 1 ? "s" : ""}`}
                                      </button>
                                    </form>
                                    {mintingSuccess && <div className="mt-4 p-3 text-sm text-green-300 bg-green-500/10 border border-green-500/30 rounded-lg">{mintingSuccess}</div>}
                                    {error && <div className="mt-4 p-3 text-sm text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg">Error: {error}</div>}
                                </div>
                            )}
                            {activeMainTab === 'active' && (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">My Active Credits ({userTokens.length})</h3>
                                    <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                                        {userTokens.length > 0 ? userTokens.map(token => (
                                            <div key={token.tokenId} className="border border-gray-700 rounded-lg p-4 bg-slate-800/50 flex justify-between items-start">
                                                <div className="text-sm text-gray-300">
                                                    <strong className="text-slate-100">Token #{token.tokenId}</strong>
                                                    <p>Factory: {token.factoryId}</p>
                                                    <p>Created: {new Date(token.creationTimestamp).toLocaleDateString()}</p>
                                                </div>
                                                <button onClick={() => initiateRetireToken(token.tokenId)} disabled={retiringTokenId === token.tokenId}
                                                    className="bg-gradient-to-r from-rose-600 to-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-md hover:opacity-90 transition disabled:opacity-50">
                                                    {retiringTokenId === token.tokenId ? 'Retiring...' : 'Retire'}
                                                </button>
                                            </div>
                                        )) : <p className="text-gray-400">No active tokens found.</p>}
                                    </div>
                                </div>
                            )}
                            {activeMainTab === 'transfer' && (
                                 <div>
                                     <h3 className="text-lg font-semibold text-white mb-4">Transfer Credits</h3>
                                      <EnhancedTransferComponent userTokens={userTokens} onTransferSuccess={() => console.log("Transfer successful!")} />
                                 </div>
                            )}
                             {activeMainTab === 'facilities' && producerData && (
                                <div>
                                    <h3 className="text-lg font-semibold text-white mb-4">Production Facilities</h3>
                                     <div className="space-y-3">
                                        {producerData.productionFacilities.map((facility) => (
                                            <div key={facility.id} className="facility-item border border-gray-700 rounded-lg p-4 bg-slate-800/50 text-gray-300">
                                                <div className="flex justify-between items-center">
                                                    <strong className="text-white">{facility.name}</strong>
                                                     <span className={`px-2 py-0.5 text-xs rounded-full ${facility.status === "Active" ? "bg-green-500/20 text-green-300" : "bg-red-500/20 text-red-300"}`}>
                                                         {facility.status}
                                                     </span>
                                                </div>
                                                <p className="text-sm text-gray-400 mt-1">Capacity: {facility.capacity}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default ProducerDashboard;
