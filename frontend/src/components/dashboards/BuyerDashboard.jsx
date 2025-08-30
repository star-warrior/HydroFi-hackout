import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { useBlockchain } from "../../contexts/BlockchainContext";

// --- Reusable Components ---

// Modal Component for Confirmations
const CustomModal = ({ title, message, onConfirm, onCancel, confirmText, cancelText }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 transition-opacity duration-300">
    <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-sm w-full mx-4 transform transition-all duration-300 scale-95 hover:scale-100">
      <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
      <p className="text-gray-300 mb-6">{message}</p>
      <div className="flex justify-end space-x-4">
        <button
          onClick={onCancel}
          className="px-6 py-2 rounded-md text-sm font-semibold bg-gray-700 hover:bg-gray-600 transition-colors duration-200 text-white"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          className="px-6 py-2 rounded-md text-sm font-semibold bg-red-600 hover:bg-red-700 transition-colors duration-200 text-white"
        >
          {confirmText}
        </button>
      </div>
    </div>
  </div>
);

// Stat Card Component
const StatCard = ({ icon, title, value, description }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col justify-between">
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <div className="text-gray-500">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
    <p className="text-xs text-gray-500 mt-2">{description}</p>
  </div>
);

// Token List Item Component
const TokenListItem = ({ token, isRetired, onRetire }) => (
    <div className={`bg-gray-900/50 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between transition-all hover:bg-gray-700/50 ${isRetired ? 'opacity-60' : ''}`}>
        <div className="flex-grow">
            <div className="flex items-center justify-between">
                <p className="font-bold text-white">Token #{token.tokenId}</p>
                {isRetired && (
                    <span className="text-xs px-2 py-1 rounded-full bg-gray-600 text-gray-300">Retired</span>
                )}
            </div>
            <div className="text-xs text-gray-400 mt-2 space-y-1 sm:space-y-0 sm:flex sm:space-x-4">
                <span>Factory: <span className="font-mono">{token.factoryId}</span></span>
                {isRetired ? (
                    <span>Retired: {new Date(token.retirementTimestamp).toLocaleDateString()}</span>
                ) : (
                    <span>Purchased: {new Date(token.lastTransferTimestamp).toLocaleDateString()}</span>
                )}
                 <span className="truncate">Creator: <span className="font-mono">{token.creator.slice(0, 10)}...</span></span>
            </div>
        </div>
        {!isRetired && (
            <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                <button
                    onClick={() => onRetire(token.tokenId)}
                    className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 px-4 rounded-md text-sm transition-colors duration-200"
                >
                    Retire
                </button>
            </div>
        )}
    </div>
);


// --- SVG Icons ---
const WalletIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M11 5.5a.5.5 0 0 1 .5-.5h2a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-2a.5.5 0 0 1-.5-.5v-1z"/><path d="M2 2a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H2zm13 2v5H1V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1z"/></svg>;
const ArchiveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M.5 1a.5.5 0 0 0 0 1h15a.5.5 0 0 0 0-1H.5zM1 2.5v11a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-11A1.5 1.5 0 0 0 13.5 1h-11A1.5 1.5 0 0 0 1 2.5zM2 3a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-1 0v-9A.5.5 0 0 1 2 3zm11.5 0a.5.5 0 0 1 .5.5v9a.5.5 0 0 1-1 0v-9a.5.5 0 0 1 .5-.5z"/></svg>;
const CollectionIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M2 3a.5.5 0 0 0 .5.5h11a.5.5 0 0 0 0-1h-11A.5.5 0 0 0 2 3zm2-2a.5.5 0 0 0 .5.5h7a.5.5 0 0 0 0-1h-7A.5.5 0 0 0 4 1zm2.5 6.5a.5.5 0 0 0 .5.5h3a.5.5 0 0 0 0-1h-3a.5.5 0 0 0-.5.5z"/><path d="M.5 1a.5.5 0 0 0-1 0V3a.5.5 0 0 0 .5.5H1v1H.5a.5.5 0 0 0-1 0V6a.5.5 0 0 0 .5.5H1v1H.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .5.5H1v1H.5a.5.5 0 0 0-1 0v2a.5.5 0 0 0 .5.5H1v1H.5a.5.5 0 0 0-1 0v1.5a.5.5 0 0 0 .5.5H16a.5.5 0 0 0 .5-.5v-15a.5.5 0 0 0-.5-.5H.5zM15 15H2V2h13v13z"/></svg>;
const DollarIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 16 16"><path d="M4 10.781c.524 1.664 2.132 2.75 4 2.75 1.79 0 3.326-1.02 3.968-2.583.142-.361.343-.72.56-1.093l.001-.001.001-.001c.21-.365.402-.718.57-1.064l.001-.002.001-.001c.16-.334.302-.652.42-1.026.12-.38.21-.78.28-1.21.07-.44.1-1.01.1-1.486 0-.505-.04-1.11-.15-1.78a1.5 1.5 0 0 0-1.5-1.5H8.5V.5a.5.5 0 0 0-1 0V2H6a1.5 1.5 0 0 0-1.5 1.5c0 .358.068.707.2 1.037.13.324.305.67.527 1.036.22.36.47.746.75 1.157.28.41.6.86.96 1.362.37.51.78.99 1.25 1.433.46.43.98.79 1.56.98.6.2 1.28.22 1.98.02.72-.2 1.38-.62 1.84-1.22.1-.12.2-.25.28-.39l.008-.013c.07-.12.13-.24.18-.37.05-.12.09-.24.11-.36.03-.12.04-.24.04-.37 0-.25-.09-.5-.28-.7-.2-.2-.5-.3-.8-.3h-3.2v-1h3.2c.8 0 1.5.4 1.8 1 .3.6.4 1.3.4 2.1 0 .53-.05 1.18-.16 1.85-.12.68-.34 1.34-.67 1.97-.33.64-.77 1.2-1.32 1.67-.55.47-1.2.8-1.93.96-.73.15-1.5.1-2.25-.13-.75-.23-1.42-.64-1.95-1.22-.53-.58-.92-1.3-1.14-2.15z"/></svg>;

// --- Main Dashboard Component ---

const BuyerDashboard = () => {
  const [buyerData, setBuyerData] = useState(null);
  const [transferToAddress, setTransferToAddress] = useState("");
  const [selectedTokenId, setSelectedTokenId] = useState("");
  const [modalInfo, setModalInfo] = useState({ isOpen: false });
  const [activeTab, setActiveTab] = useState("owned");
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const { tokens, loading, error, fetchTokens, transferToken, retireToken } = useBlockchain();

  useEffect(() => {
    const fetchBuyerData = async () => {
      try {
        // Mock data for demonstration - replace with your actual API call
        // const response = await axios.get("/api/dashboard/buyer", {
        //   headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        // });
        const mockData = {
          marketPrices: [
            { type: 'Solar Credits', price: 85.50, change: '+1.25%' },
            { type: 'Wind Credits', price: 78.20, change: '-0.50%' },
            { type: 'Hydro Credits', price: 92.00, change: '+2.10%' },
          ]
        };
        setBuyerData({ data: mockData });
      } catch (error) {
        console.error("Failed to fetch buyer data:", error);
      }
    };

    fetchBuyerData();
    fetchTokens();
  }, [fetchTokens]);
  
  const showFeedback = (type, message) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback({ type: "", message: "" }), 5000);
  };

  const handleTransferToken = async (e) => {
    e.preventDefault();
    if (!selectedTokenId || !transferToAddress.trim()) {
      showFeedback("error", "Please select a token and enter a recipient address.");
      return;
    }
    try {
      await transferToken(selectedTokenId, transferToAddress);
      showFeedback("success", "Token transferred successfully!");
      setSelectedTokenId("");
      setTransferToAddress("");
    } catch (err) {
      console.error("Transfer failed:", err);
      showFeedback("error", err.message || "Transfer failed. Please try again.");
    }
  };

  const confirmRetireToken = (tokenId) => {
    setModalInfo({
      isOpen: true,
      title: "Confirm Retirement",
      message: `Are you sure you want to retire Token #${tokenId}? This action is permanent and cannot be undone.`,
      confirmText: "Retire Token",
      cancelText: "Cancel",
      onConfirm: () => handleRetireToken(tokenId),
      onCancel: () => setModalInfo({ isOpen: false }),
    });
  };

  const handleRetireToken = async (tokenId) => {
    try {
      await retireToken(tokenId);
      showFeedback("success", `Token #${tokenId} retired successfully!`);
    } catch (err) {
      console.error("Retirement failed:", err);
      showFeedback("error", err.message || "Retirement failed. Please try again.");
    } finally {
      setModalInfo({ isOpen: false });
    }
  };

  const { ownedTokens, retiredTokens } = useMemo(() => ({
    ownedTokens: tokens.filter((token) => !token.isRetired),
    retiredTokens: tokens.filter((token) => token.isRetired),
  }), [tokens]);

  const portfolioValue = (ownedTokens.length * 85.50).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  });
  
  const statCards = [
    { icon: <WalletIcon />, title: 'Owned Credits', value: ownedTokens.length, description: 'Active credits available in your portfolio.' },
    { icon: <ArchiveIcon />, title: 'Retired Credits', value: retiredTokens.length, description: 'Credits you have permanently retired.' },
    { icon: <CollectionIcon />, title: 'Total Credits', value: tokens.length, description: 'All credits you have ever owned.' },
    { icon: <DollarIcon />, title: 'Portfolio Value', value: portfolioValue, description: 'Estimated value of your owned credits.' },
  ];
  
  const displayedTokens = activeTab === "owned" ? ownedTokens : retiredTokens;

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      {modalInfo.isOpen && <CustomModal {...modalInfo} />}
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Buyer Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage, transfer, and retire your green hydrogen credits.</p>
        </header>

        {/* --- Stats Grid --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => <StatCard key={index} {...card} />)}
        </div>
        
        {/* --- Main Content Grid --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
          {/* --- Left Column: Actions --- */}
          <div className="lg:col-span-1 space-y-8">
            {/* Transfer Credits Card */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Transfer Credit</h3>
              <form onSubmit={handleTransferToken}>
                <div className="mb-4">
                  <label htmlFor="tokenSelect" className="block text-sm font-medium text-gray-300 mb-2">Select Credit:</label>
                  <select
                    id="tokenSelect"
                    value={selectedTokenId}
                    onChange={(e) => setSelectedTokenId(e.target.value)}
                    className="w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    required
                  >
                    <option value="">Choose a credit...</option>
                    {ownedTokens.map((token) => (
                      <option key={token.tokenId} value={token.tokenId}>
                        Token #{token.tokenId} (Factory: {token.factoryId})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label htmlFor="transferAddress" className="block text-sm font-medium text-gray-300 mb-2">Recipient Address:</label>
                  <input
                    type="text"
                    id="transferAddress"
                    value={transferToAddress}
                    onChange={(e) => setTransferToAddress(e.target.value)}
                    placeholder="0x..."
                    className="w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition font-mono"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading || ownedTokens.length === 0}
                  className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-4 rounded-md transition-all duration-200 ease-in-out disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Transferring...
                    </>
                  ) : "Transfer Credit"}
                </button>
              </form>
               {(feedback.message || error) && (
                  <div className={`mt-4 text-sm p-3 rounded-md ${
                      feedback.type === 'success' ? 'bg-green-900/50 text-green-300' : 'bg-red-900/50 text-red-300'
                  }`}>
                      {feedback.message || `Error: ${error}`}
                  </div>
              )}
            </div>

            {/* Market Prices Card */}
            {buyerData?.data?.marketPrices && (
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Market Snapshot</h3>
                <div className="space-y-3">
                  {buyerData.data.marketPrices.map((price, index) => (
                    <div key={index} className="bg-gray-700/50 p-3 rounded-md text-sm flex justify-between items-center">
                      <div>
                        <span className="font-semibold text-white">{price.type}</span>
                        <p className="text-gray-400">${price.price}/credit</p>
                      </div>
                      <span className={`font-bold ${price.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                        {price.change}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* --- Right Column: Token Lists --- */}
          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex border-b border-gray-700 mb-4">
              <button
                onClick={() => setActiveTab('owned')}
                className={`py-2 px-4 text-sm font-medium transition-colors ${activeTab === 'owned' ? 'border-b-2 border-green-500 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Owned Credits ({ownedTokens.length})
              </button>
              <button
                onClick={() => setActiveTab('retired')}
                className={`py-2 px-4 text-sm font-medium transition-colors ${activeTab === 'retired' ? 'border-b-2 border-green-500 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Retired Credits ({retiredTokens.length})
              </button>
            </div>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {displayedTokens.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No {activeTab} credits found.</p>
                  {activeTab === 'owned' && <p className="mt-2 text-sm">Purchase credits from the marketplace to get started!</p>}
                </div>
              ) : (
                displayedTokens.map((token) => (
                    <TokenListItem 
                        key={token.tokenId} 
                        token={token}
                        isRetired={activeTab === 'retired'}
                        onRetire={confirmRetireToken}
                    />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;