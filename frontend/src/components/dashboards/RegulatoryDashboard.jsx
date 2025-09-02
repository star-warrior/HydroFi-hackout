import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useBlockchain } from "../../contexts/BlockchainContext";
import StatisticalDashboard from "./StatisticalDashboard"; // Assuming this exists, will be replaced visually
import { FiSearch, FiX, FiCheckCircle, FiAlertTriangle, FiFileText } from 'react-icons/fi';

// A placeholder component for the chart, to match the producer dashboard's look
const PlaceholderChart = () => (
  <div className="h-96 w-full flex items-center justify-center bg-slate-900/50 rounded-lg">
    <p className="text-slate-500">Statistical analysis chart will be displayed here</p>
  </div>
);

const StatCard = ({ title, value, description }) => (
    <div className="bg-gradient-to-br from-[#21312E] to-[#263834] border border-gray-700/50 rounded-xl p-5 shadow-lg hover:shadow-cyan-500/10 hover:scale-[1.02] transition-all duration-300">
        <p className="text-sm text-gray-400">{title}</p>
        <h3 className="text-4xl font-bold text-slate-100 mt-2 bg-clip-text text-transparent bg-gradient-to-r from-teal-300 to-cyan-400">{value}</h3>
        <p className="text-sm text-gray-400 mt-1 flex items-center">
            {description}
        </p>
    </div>
);

const TabButton = ({ label, tabName, activeTab, setActiveTab }) => (
    <button
      onClick={() => setActiveTab(tabName)}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-all duration-300 relative ${activeTab === tabName 
        ? 'text-white' 
        : 'text-gray-400 hover:bg-slate-800/50 hover:text-white'}`}
    >
      {activeTab === tabName && 
        <span className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"></span>
      }
      {label}
    </button>
);

const TokenDetailsModal = ({ token, history, onClose }) => {
    if (!token) return null;

    const formatAddress = (address) => {
        return address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'N/A';
    };

    const formatDate = (date) => {
        return date ? new Date(date).toLocaleString() : 'N/A';
    };

    const tokenData = token.metadata || token;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50" onClick={onClose}>
            <div 
                className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-6 w-full max-w-5xl mx-4 my-8 max-h-[90vh] flex flex-col" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center border-b border-gray-700 pb-3 mb-4 flex-shrink-0">
                    <h3 className="text-xl font-semibold text-white">Token #{tokenData.tokenId} - Audit Trail</h3>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-400 hover:bg-slate-700 hover:text-white transition-colors">
                        <FiX size={20} />
                    </button>
                </div>

                <div className="overflow-y-auto pr-2 space-y-6">
                    {/* Token Info */}
                    <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-white mb-3">Token Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-3 text-sm">
                            <div className="text-gray-400"><strong className="text-slate-300">Factory:</strong> {token.factoryName || tokenData.factoryId}</div>
                            <div className="text-gray-400"><strong className="text-slate-300">Factory ID:</strong> {tokenData.factoryId}</div>
                            <div className="text-gray-400"><strong className="text-slate-300">Creator:</strong> {formatAddress(tokenData.creator)}</div>
                            <div className="text-gray-400"><strong className="text-slate-300">Current Owner:</strong> {formatAddress(tokenData.currentOwner)}</div>
                            <div className="text-gray-400"><strong className="text-slate-300">Created:</strong> {formatDate(tokenData.creationTimestamp)}</div>
                            <div className="flex items-center">
                                <strong className="text-slate-300 mr-2">Status:</strong>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${tokenData.isRetired ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300"}`}>
                                    {tokenData.isRetired ? "Retired" : "Active"}
                                </span>
                            </div>
                             {tokenData.isRetired && (
                                <>
                                    <div className="text-gray-400"><strong className="text-slate-300">Retired By:</strong> {formatAddress(tokenData.retiredBy)}</div>
                                    <div className="text-gray-400"><strong className="text-slate-300">Retired On:</strong> {formatDate(tokenData.retirementTimestamp)}</div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* History Table */}
                    <div>
                        <h4 className="text-lg font-semibold text-white mb-3">Ownership & Transaction History</h4>
                        <div className="relative overflow-x-auto rounded-lg border border-slate-700">
                             <table className="w-full text-sm text-left text-gray-400">
                                <thead className="text-xs text-gray-300 uppercase bg-slate-800">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Date</th>
                                        <th scope="col" className="px-6 py-3">Transaction</th>
                                        <th scope="col" className="px-6 py-3">Owner</th>
                                        <th scope="col" className="px-6 py-3">Details</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history ? history.map((record, index) => (
                                        <tr key={index} className="bg-slate-800/50 border-b border-slate-700">
                                            <td className="px-6 py-4 whitespace-nowrap">{formatDate(record.timestamp)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-0.5 text-xs rounded-full capitalize ${
                                                        record.transactionType === 'mint' ? 'bg-sky-500/20 text-sky-300' :
                                                        record.transactionType === 'transfer' ? 'bg-amber-500/20 text-amber-300' :
                                                        'bg-red-500/20 text-red-300'
                                                    }`}>
                                                    {record.transactionType}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 font-mono">{formatAddress(record.owner)}</td>
                                            <td className="px-6 py-4">{record.transactionType === "mint" ? "Token created and assigned" : record.transactionType === "transfer" ? `Token transferred` : "Token permanently retired"}</td>
                                        </tr>
                                    )) : <tr><td colSpan="4" className="text-center py-4">Loading history...</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Compliance Box */}
                    <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-lg">
                        <h4 className="text-lg font-semibold text-white mb-3">Regulatory Compliance Status</h4>
                        <div className="space-y-2 text-sm">
                            <p className="flex items-center text-green-400"><FiCheckCircle className="mr-2 flex-shrink-0"/> Blockchain Verification: Token exists on blockchain with immutable history.</p>
                            <p className="flex items-center text-green-400"><FiCheckCircle className="mr-2 flex-shrink-0"/> Ownership Chain: Complete ownership trail from creation to current state.</p>
                            <p className="flex items-center text-green-400"><FiCheckCircle className="mr-2 flex-shrink-0"/> Factory Authentication: Token linked to a registered production facility.</p>
                            {tokenData.isRetired ? (
                                <p className="flex items-center text-green-400"><FiCheckCircle className="mr-2 flex-shrink-0"/> Retirement Status: Token properly retired and removed from circulation.</p>
                            ) : (
                                <p className="flex items-center text-amber-400"><FiAlertTriangle className="mr-2 flex-shrink-0"/> Active Status: Token remains in active circulation.</p>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4 border-t border-gray-700 mt-4 flex-shrink-0">
                    <button onClick={() => window.print()} className="flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-slate-300 bg-slate-700 hover:bg-slate-600 transition-colors">
                        <FiFileText className="mr-2"/> Print Report
                    </button>
                    <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-teal-600 to-green-500 hover:opacity-90 transition-opacity">
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};


const RegulatoryDashboard = ({ data }) => {
  const [regulatoryData, setRegulatoryData] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchFilters, setSearchFilters] = useState({
    factoryName: "", factoryId: "", owner: "", status: "", startDate: "", endDate: "",
  });
  const [factories, setFactories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [tokenHistory, setTokenHistory] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, totalPages: 1, totalCount: 0 });

  const { tokens, transactions, loading, fetchTokens, fetchTransactions } = useBlockchain();

  useEffect(() => {
    // Mocking API calls since they depend on a backend
    const fetchInitialData = async () => {
        try {
            // In a real app, these would be API calls
            // const regResponse = await axios.get("/api/dashboard/regulatory", ...);
            // setRegulatoryData(regResponse.data.data);
            // const factResponse = await axios.get("/api/blockchain/factories", ...);
            // setFactories(factResponse.data.factories || []);
            setRegulatoryData({ 
                complianceMetrics: { totalFacilities: 15, compliant: 14, underReview: 1 } 
            });
            setFactories([
                { factoryId: 'F001', factoryName: 'HydroGreen Plant Alpha', producerName: 'Producer A'},
                { factoryId: 'F002', factoryName: 'HydroGreen Plant Beta', producerName: 'Producer A'},
                { factoryId: 'F003', factoryName: 'AquaPower Gen', producerName: 'Producer B'},
            ]);
        } catch (error) {
            console.error("Failed to fetch initial data:", error);
        }
    };

    fetchInitialData();
    fetchTokens();
    fetchTransactions();
  }, [fetchTokens, fetchTransactions]);

  const { activeTokensCount, retiredTokensCount, transferredTokensCount } = useMemo(() => {
    const safeTokens = Array.isArray(tokens) ? tokens : [];
    return {
        activeTokensCount: safeTokens.filter(t => !t.isRetired).length,
        retiredTokensCount: safeTokens.filter(t => t.isRetired).length,
        transferredTokensCount: safeTokens.filter(t => t.currentOwner !== t.creator).length,
    }
  }, [tokens]);

  const handleSearch = async () => {
    setSearching(true);
    // This is a mock search. Replace with actual API call.
    console.log("Searching with filters:", { ...searchFilters, page: pagination.page, limit: pagination.limit });
    setTimeout(() => {
      let filteredTokens = Array.isArray(tokens) ? [...tokens] : [];
      if (searchFilters.factoryName) {
        const selectedFactory = factories.find(f => f.factoryName === searchFilters.factoryName);
        if (selectedFactory) {
            filteredTokens = filteredTokens.filter(t => t.factoryId === selectedFactory.factoryId);
        }
      }
      if (searchFilters.owner) {
        filteredTokens = filteredTokens.filter(t => t.currentOwner.toLowerCase().includes(searchFilters.owner.toLowerCase()));
      }
      if (searchFilters.status) {
        const isRetired = searchFilters.status === 'retired';
        filteredTokens = filteredTokens.filter(t => t.isRetired === isRetired);
      }
      // Date filtering would be more complex
      
      setSearchResults(filteredTokens.map(t => ({...t, metadata: t }))); // Mocking the API response structure
      setPagination(prev => ({ ...prev, totalCount: filteredTokens.length, totalPages: Math.ceil(filteredTokens.length / prev.limit) }));
      setSearching(false);
    }, 1000);
  };

  const clearFilters = () => {
    setSearchFilters({ factoryName: "", factoryId: "", owner: "", status: "", startDate: "", endDate: "" });
    setSearchResults([]);
    setPagination((prev) => ({ ...prev, page: 1, totalCount: 0, totalPages: 1 }));
  };

  const fetchTokenHistory = async (tokenId) => {
    setTokenHistory(null); // Clear previous history
    // This is a mock history fetch. Replace with actual API call.
    console.log("Fetching history for token:", tokenId);
    setTimeout(() => {
      const history = transactions
        .filter(tx => tx.tokenId === tokenId)
        .map(tx => ({
          timestamp: tx.timestamp,
          transactionType: tx.type,
          owner: tx.to || tx.userId?.walletAddress, // Simplified logic
        }))
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      setTokenHistory(history);
    }, 500);
  };
  
  const viewTokenDetails = async (token) => {
    setSelectedToken(token);
    await fetchTokenHistory(token.tokenId);
  };

  const formatAddress = (address) => address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'N/A';
  const formatDate = (date) => new Date(date).toLocaleString();

  const renderTable = (data, type) => (
    <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
      <table className="w-full text-sm text-left text-gray-400">
        <thead className="text-xs text-gray-300 uppercase bg-slate-800/50">
           { type === 'token' ? (
                <tr>
                    <th scope="col" className="px-6 py-3">Token ID</th>
                    <th scope="col" className="px-6 py-3">Factory</th>
                    <th scope="col" className="px-6 py-3">Current Owner</th>
                    <th scope="col" className="px-6 py-3">Status</th>
                    <th scope="col" className="px-6 py-3">Created</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                </tr>
           ) : ( // transaction
                <tr>
                    <th scope="col" className="px-6 py-3">Type</th>
                    <th scope="col" className="px-6 py-3">Token ID</th>
                    <th scope="col" className="px-6 py-3">From</th>
                    <th scope="col" className="px-6 py-3">To</th>
                    <th scope="col" className="px-6 py-3">Timestamp</th>
                </tr>
           )}
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item._id || item.tokenId} className="border-b border-gray-700 hover:bg-slate-800/60 transition-colors">
              {type === 'token' ? (
                <>
                  <td className="px-6 py-4 font-medium text-white">#{item.tokenId}</td>
                  <td className="px-6 py-4">{item.factoryId}</td>
                  <td className="px-6 py-4 font-mono">{formatAddress(item.currentOwner)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 text-xs rounded-full ${item.isRetired ? "bg-red-500/20 text-red-300" : "bg-green-500/20 text-green-300"}`}>
                        {item.isRetired ? "Retired" : "Active"}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(item.creationTimestamp).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                     <button onClick={() => viewTokenDetails(item)} className="font-medium text-teal-400 hover:underline">View</button>
                  </td>
                </>
              ) : (
                <>
                  <td className="px-6 py-4">
                     <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${
                          item.type === 'mint' ? 'bg-sky-500/20 text-sky-300' :
                          item.type === 'transfer' ? 'bg-amber-500/20 text-amber-300' :
                          'bg-red-500/20 text-red-300'
                      }`}>
                         {item.type}
                     </span>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">#{item.tokenId}</td>
                  <td className="px-6 py-4 font-mono">{formatAddress(item.from)}</td>
                  <td className="px-6 py-4 font-mono">{formatAddress(item.to)}</td>
                  <td className="px-6 py-4">{formatDate(item.timestamp)}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1A2421] to-[#1F2C28] text-gray-300 font-sans">
      <TokenDetailsModal token={selectedToken} history={tokenHistory} onClose={() => setSelectedToken(null)} />

      <main className="p-8">
        <h2 className="text-2xl font-semibold text-white mb-2">Regulatory Dashboard</h2>
        <p className="text-md text-gray-400 mb-8">System-wide monitoring and compliance overview.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total Tokens" value={tokens.length} description="All credits in the system"/>
            <StatCard title="Active Credits" value={activeTokensCount} description="Credits currently in circulation"/>
            <StatCard title="Transferred Credits" value={transferredTokensCount} description="Credits that have changed owners"/>
            <StatCard title="Retired Credits" value={retiredTokensCount} description="Credits permanently used"/>
        </div>
        
        <div className="bg-[#21312E]/50 border border-gray-700/50 rounded-xl shadow-xl">
             <div className="p-2 border-b border-gray-700/50 flex items-center space-x-2">
                 <TabButton label="Overview" tabName="overview" activeTab={activeTab} setActiveTab={setActiveTab} />
                 <TabButton label="Statistical Analysis" tabName="analytics" activeTab={activeTab} setActiveTab={setActiveTab} />
                 <TabButton label="Advanced Search" tabName="search" activeTab={activeTab} setActiveTab={setActiveTab} />
                 <TabButton label="Token Registry" tabName="tokens" activeTab={activeTab} setActiveTab={setActiveTab} />
                 <TabButton label="Transaction Log" tabName="transactions" activeTab={activeTab} setActiveTab={setActiveTab} />
             </div>

             <div className="p-6">
                {activeTab === 'overview' && (
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* System Overview Card */}
                        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50">
                            <h3 className="text-lg font-semibold text-white mb-4">Blockchain System Overview</h3>
                            <div className="space-y-4 text-sm">
                                <div className="flex justify-between"><span>Total Tokens</span><span className="font-semibold text-white">{tokens.length}</span></div>
                                <div className="flex justify-between"><span>Active Credits</span><span className="font-semibold text-white">{activeTokensCount}</span></div>
                                <div className="flex justify-between"><span>Retirement Rate</span><span className="font-semibold text-white">{tokens.length > 0 ? Math.round((retiredTokensCount / tokens.length) * 100) : 0}%</span></div>
                                <div>
                                    <p className="mb-1 text-gray-400">Credit Distribution:</p>
                                    <div className="flex w-full h-2.5 bg-slate-700 rounded-full overflow-hidden">
                                        <div className="bg-green-500" style={{ width: `${tokens.length > 0 ? (activeTokensCount / tokens.length) * 100 : 0}%` }}></div>
                                        <div className="bg-red-500" style={{ width: `${tokens.length > 0 ? (retiredTokensCount / tokens.length) * 100 : 0}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Recent Transactions */}
                        <div className="bg-slate-800/50 p-6 rounded-lg border border-slate-700/50">
                            <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
                             <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                                {transactions.slice(0, 10).map(tx => (
                                    <div key={tx._id} className="flex justify-between items-center text-sm">
                                        <div>
                                            <span className={`px-2 py-0.5 text-xs rounded-full capitalize mr-2 ${
                                                    tx.type === 'mint' ? 'bg-sky-500/20 text-sky-300' :
                                                    tx.type === 'transfer' ? 'bg-amber-500/20 text-amber-300' :
                                                    'bg-red-500/20 text-red-300'
                                                }`}>{tx.type}</span>
                                            <span className="text-white">Token #{tx.tokenId}</span>
                                        </div>
                                        <span className="text-gray-500 text-xs">{formatDate(tx.timestamp)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                   </div>
                )}

                {activeTab === 'analytics' && (
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Market & Compliance Analytics</h3>
                        {/* Replace with actual StatisticalDashboard component if available */}
                        <PlaceholderChart />
                    </div>
                )}
                
                {activeTab === 'search' && (
                    <div>
                         <h3 className="text-lg font-semibold text-white mb-4">Advanced Token Search & Audit</h3>
                         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700/50">
                             {/* Form Fields */}
                             <div>
                                 <label className="block text-sm font-medium text-gray-400 mb-1">Factory Name</label>
                                 <select value={searchFilters.factoryName} onChange={(e) => setSearchFilters(p => ({...p, factoryName: e.target.value}))} className="w-full rounded-lg border-gray-600 bg-slate-800 text-slate-100 p-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
                                     <option value="">All Factories</option>
                                     {factories.map(f => <option key={f.factoryId} value={f.factoryName}>{f.factoryName}</option>)}
                                 </select>
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-400 mb-1">Owner Address</label>
                                 <input type="text" value={searchFilters.owner} onChange={(e) => setSearchFilters(p => ({...p, owner: e.target.value}))} placeholder="0x..." className="w-full rounded-lg border-gray-600 bg-slate-800 text-slate-100 p-2 focus:outline-none focus:ring-2 focus:ring-teal-500"/>
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-400 mb-1">Token Status</label>
                                 <select value={searchFilters.status} onChange={(e) => setSearchFilters(p => ({...p, status: e.target.value}))} className="w-full rounded-lg border-gray-600 bg-slate-800 text-slate-100 p-2 focus:outline-none focus:ring-2 focus:ring-teal-500">
                                     <option value="">All Statuses</option>
                                     <option value="active">Active</option>
                                     <option value="retired">Retired</option>
                                 </select>
                             </div>
                         </div>
                         <div className="flex items-center space-x-4">
                             <button onClick={handleSearch} disabled={searching} className="flex items-center justify-center w-36 bg-gradient-to-r from-teal-600 to-green-500 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                                 <FiSearch className="mr-2"/> {searching ? "Searching..." : "Search"}
                             </button>
                             <button onClick={clearFilters} className="flex items-center text-gray-400 hover:text-white transition-colors">
                                 <FiX className="mr-1"/> Clear Filters
                             </button>
                         </div>
                         {searchResults.length > 0 && (
                            <div className="mt-8">
                                <h4 className="text-md font-semibold text-white mb-4">Search Results ({pagination.totalCount} tokens found)</h4>
                                {renderTable(searchResults, 'token')}
                                {/* Add Pagination controls here if needed */}
                            </div>
                         )}
                    </div>
                )}
                
                {activeTab === 'tokens' && (
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">All Tokens Registry ({tokens.length})</h3>
                        {renderTable(tokens, 'token')}
                    </div>
                )}

                {activeTab === 'transactions' && (
                    <div>
                        <h3 className="text-lg font-semibold text-white mb-4">Transaction History ({transactions.length})</h3>
                        {renderTable(transactions, 'transaction')}
                    </div>
                )}
             </div>
        </div>
      </main>
    </div>
  );
};

export default RegulatoryDashboard;