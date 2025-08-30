import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useBlockchain } from "../../contexts/BlockchainContext";

// Custom Modal Component
const CustomModal = ({ title, message, onConfirm, onCancel, confirmText, cancelText }) => (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
    <div className="bg-gray-800 rounded-lg shadow-xl p-8 max-w-sm w-full mx-4">
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
const StatCard = ({ icon, title, value, change, changeType, description }) => (
  <div className="bg-gray-800 p-6 rounded-lg shadow-lg flex flex-col justify-between">
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <span className={`flex items-center text-xs font-semibold ${changeType === 'increase' ? 'text-green-400' : 'text-red-400'}`}>
          {icon}
          {change}
        </span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
    <p className="text-xs text-gray-500 mt-2">{description}</p>
  </div>
);

// Icons
const BoltIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="inline-block mr-1" viewBox="0 0 16 16">
    <path d="M5.52.359A.5.5 0 0 1 6 0h4a.5.5 0 0 1 .474.658L8.694 6H12.5a.5.5 0 0 1 .395.807l-7 9a.5.5 0 0 1-.873-.454L6.823 9.5H3.5a.5.5 0 0 1-.48-.641l2.5-8.5z"/>
  </svg>
);

const BanIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="inline-block mr-1" viewBox="0 0 16 16">
    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM2.71 12.585a6.973 6.973 0 0 0 8.875-8.875a6.973 6.973 0 0 0-8.875 8.875z"/>
  </svg>
);

const CoinsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="inline-block mr-1" viewBox="0 0 16 16">
    <path d="M8 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm0-1a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
    <path d="M8 13.25A4.25 4.25 0 1 0 8 4.75a4.25 4.25 0 0 0 0 8.5zM8 13.5A4.5 4.5 0 1 0 8 4.5a4.5 4.5 0 0 0 0 9z"/>
    <path d="M12 1a1 1 0 0 1 1 1v1h1a1 1 0 0 1 1 1v1h-1v1a1 1 0 0 1-1 1h-1v1a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v-1H7a1 1 0 0 1-1-1V8H5a1 1 0 0 1-1-1V6h1V5a1 1 0 0 1 1-1h1V3a1 1 0 0 1 1-1h2z"/>
  </svg>
);

const HandshakeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="inline-block mr-1" viewBox="0 0 16 16">
    <path d="M8.5 3a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-1.5 1a.5.5 0 0 0-.5.5V13a.5.5 0 0 0 1 0V4.5a.5.5 0 0 0-.5-.5z"/>
    <path d="M14.25 7.5a1.25 1.25 0 1 0-2.5 0v4.839a.25.25 0 0 0 .401.192l1.623-1.42A1.25 1.25 0 0 0 14.25 10V7.5z"/>
    <path d="M1.75 7.5a1.25 1.25 0 1 0 2.5 0v2.5a1.25 1.25 0 1 0 2.5 0V7.5a1.25 1.25 0 1 0-2.5 0v4.839a.25.25 0 0 0 .401.192l1.623-1.42A1.25 1.25 0 0 0 6.75 10V7.5a1.25 1.25 0 0 0-2.5 0v2.5a1.25 1.25 0 0 0-2.5 0V7.5z"/>
  </svg>
);

const ProducerDashboard = () => {
  const [producerData, setProducerData] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mintingSuccess, setMintingSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("active");
  const [modalInfo, setModalInfo] = useState({ isOpen: false });

  const { user } = useAuth();
  const { tokens, loading, error, mintTokens, fetchTokens, retireToken } = useBlockchain();

  useEffect(() => {
    const fetchProducerData = async () => {
      try {
        // In a real implementation, you would use axios here
        // const response = await axios.get("/api/dashboard/producer", {
        //   headers: {
        //     Authorization: `Bearer ${localStorage.getItem("token")}`,
        //   },
        // });
        // setProducerData(response.data.data);
        
        // Mock data for demonstration
        const mockData = {
          productionFacilities: [
            { id: 1, name: 'Alpha Facility', capacity: '100 MW', status: 'Active' },
            { id: 2, name: 'Beta Facility', capacity: '75 MW', status: 'Maintenance' }
          ]
        };
        setProducerData(mockData);
      } catch (error) {
        console.error("Failed to fetch producer data:", error);
      }
    };

    fetchProducerData();
    fetchTokens();
  }, [fetchTokens]);

  const handleMintTokens = async (e) => {
    e.preventDefault();

    if (!user?.factoryId) {
      alert("Factory ID not found. Please contact admin.");
      return;
    }

    try {
      const result = await mintTokens(user.factoryId, quantity);
      setMintingSuccess(
        `Successfully minted ${result.mintedTokens.length} credits for factory ${user.factoryId}!`
      );
      setQuantity(1);

      // Clear success message after 5 seconds
      setTimeout(() => setMintingSuccess(null), 5000);
    } catch (err) {
      console.error("Minting failed:", err);
    }
  };

  const confirmRetireToken = (tokenId) => {
    setModalInfo({
      isOpen: true,
      title: "Confirm Retirement",
      message: `Are you sure you want to retire Token #${tokenId}? This action cannot be undone.`,
      confirmText: "Retire Token",
      cancelText: "Cancel",
      onConfirm: () => handleRetireToken(tokenId),
      onCancel: () => setModalInfo({ isOpen: false })
    });
  };

  const handleRetireToken = async (tokenId) => {
    try {
      await retireToken(tokenId);
      // Success would be handled by the context
    } catch (err) {
      console.error("Retirement failed:", err);
    } finally {
      setModalInfo({ isOpen: false });
    }
  };

  const userTokens = tokens.filter((token) => !token.isRetired);
  const retiredTokens = tokens.filter((token) => token.isRetired);
  const soldCredits = userTokens.filter((token) => token.creator !== token.currentOwner).length;

  const statCards = [
    { icon: <BoltIcon/>, title: 'Active Credits', value: userTokens.length, change: '+5.2%', changeType: 'increase', description: 'Credits available for sale or retirement.' },
    { icon: <BanIcon/>, title: 'Retired Credits', value: retiredTokens.length, change: '+2.1%', changeType: 'increase', description: 'Credits that have been permanently retired.' },
    { icon: <CoinsIcon/>, title: 'Total Minted', value: tokens.length, change: '+12.5%', changeType: 'increase', description: 'All credits ever generated by your facilities.' },
    { icon: <HandshakeIcon/>, title: 'Sold Credits', value: soldCredits, change: '-1.8%', changeType: 'decrease', description: 'Active credits sold to other parties.' },
  ];

  return (
    <div className="bg-gray-900 text-white min-h-screen p-4 sm:p-6 lg:p-8 font-sans">
      {modalInfo.isOpen && <CustomModal {...modalInfo} />}
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Producer Dashboard</h1>
          <p className="text-gray-400 mt-1">Manage your green hydrogen credits and production facilities.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((card, index) => (
            <StatCard key={index} {...card} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-8">
            {/* Token Minting Section */}
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4">Generate Green Hydrogen Credits</h3>
              
              {user?.factoryId && (
                <div className="mb-4 text-sm bg-gray-700/50 p-3 rounded-md">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Factory:</span> 
                    <span className="font-medium">{user.factoryName}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-400">Factory ID:</span> 
                    <span className="font-mono text-xs">{user.factoryId}</span>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleMintTokens}>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-300 mb-2">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  max="100"
                  className="w-full bg-gray-700 border-gray-600 rounded-md py-2 px-3 text-white focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                />
                <button
                  type="submit"
                  disabled={loading || !user?.factoryId}
                  className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-all duration-200 ease-in-out disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Minting...
                    </>
                  ) : `Generate ${quantity} Credit${quantity > 1 ? "s" : ""}`}
                </button>
              </form>
              
              {!user?.factoryId && (
                <p className="mt-4 text-center text-sm text-yellow-400 bg-yellow-900/50 p-4 rounded-md">
                  Factory ID not assigned. Please contact admin.
                </p>
              )}
              
              {mintingSuccess && (
                <div className="mt-4 text-sm text-green-300 bg-green-900/50 p-3 rounded-md animate-pulse">
                  {mintingSuccess}
                </div>
              )}
              
              {error && (
                <div className="mt-4 text-sm text-red-300 bg-red-900/50 p-3 rounded-md">
                  Error: {error}
                </div>
              )}
            </div>

            {/* Production Facilities */}
            {producerData && (
              <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
                <h3 className="text-lg font-semibold mb-4">Production Facilities</h3>
                <div className="space-y-3">
                  {producerData.productionFacilities.map((facility) => (
                    <div key={facility.id} className="bg-gray-700/50 p-3 rounded-md text-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold">{facility.name}</span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${facility.status === 'Active' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                          {facility.status}
                        </span>
                      </div>
                      <div className="text-gray-400 mt-1 text-xs">Capacity: {facility.capacity}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Token Management Section */}
          <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg shadow-lg">
            <div className="flex border-b border-gray-700 mb-4">
              <button 
                onClick={() => setActiveTab('active')} 
                className={`py-2 px-4 text-sm font-medium transition-colors ${activeTab === 'active' ? 'border-b-2 border-green-500 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Active Credits ({userTokens.length})
              </button>
              <button 
                onClick={() => setActiveTab('retired')} 
                className={`py-2 px-4 text-sm font-medium transition-colors ${activeTab === 'retired' ? 'border-b-2 border-green-500 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                Retired Credits ({retiredTokens.length})
              </button>
            </div>
            
            <div className="space-y-4">
              {(activeTab === 'active' ? userTokens : retiredTokens).length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <p>No {activeTab} credits found.</p>
                </div>
              ) : (
                (activeTab === 'active' ? userTokens : retiredTokens).map((token) => (
                  <div key={token.tokenId} className="bg-gray-900/50 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center sm:justify-between transition-all hover:bg-gray-700/50">
                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-white">Token #{token.tokenId}</p>
                        {activeTab === 'active' && (
                          <span className={`text-xs px-2 py-1 rounded-full ${token.creator === token.currentOwner ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
                            {token.creator === token.currentOwner ? "Available" : "Sold"}
                          </span>
                        )}
                        {activeTab === 'retired' && (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-600 text-gray-300">Retired</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-400 mt-2 space-y-1 sm:space-y-0 sm:flex sm:space-x-4">
                        <span>Factory: <span className="font-mono">{token.factoryId}</span></span>
                        {activeTab === 'active' ? (
                          <span>Created: {new Date(token.creationTimestamp).toLocaleDateString()}</span>
                        ) : (
                          <span>Retired: {new Date(token.retirementTimestamp).toLocaleDateString()}</span>
                        )}
                        {token.creator !== token.currentOwner && (
                          <span className="truncate">Owner: <span className="font-mono">{token.currentOwner.slice(0, 10)}...</span></span>
                        )}
                      </div>
                    </div>
                    {activeTab === 'active' && (
                      <div className="mt-4 sm:mt-0 sm:ml-4 flex-shrink-0">
                        <button 
                          onClick={() => confirmRetireToken(token.tokenId)} 
                          className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold py-1.5 px-4 rounded-md text-sm transition-colors duration-200"
                        >
                          Retire
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProducerDashboard;