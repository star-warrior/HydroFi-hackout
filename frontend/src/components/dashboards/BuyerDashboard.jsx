import React, { useState, useEffect } from "react";
import axios from "axios";
import { useBlockchain } from "../../contexts/BlockchainContext";
import { useAuth } from "../../contexts/AuthContext";

// --- Helper Components ---
const Icon = ({ path, className = "w-6 h-6" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d={path} />
  </svg>
);

const StatCard = ({ title, value, iconPath, color = "emerald" }) => (
  <div className="stat-card">
    <div className="stat-content">
      <div className="stat-text">
        <span className="stat-title">{title}</span>
        <span className="stat-value">{value}</span>
      </div>
      <div className={`stat-icon bg-${color}-100`}>
        <Icon path={iconPath} className={`text-${color}-700`} />
      </div>
    </div>
  </div>
);

// Main Buyer Dashboard Component
const BuyerDashboard = () => {
  const [buyerData, setBuyerData] = useState(null);
  const [transferToAddress, setTransferToAddress] = useState("");
  const [selectedTokenId, setSelectedTokenId] = useState("");
  
  const { user } = useAuth();
  const { tokens, loading, error, fetchTokens, transferToken, retireToken } = useBlockchain();

  useEffect(() => {
    const fetchBuyerData = async () => {
      try {
        const response = await axios.get("/api/dashboard/buyer", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setBuyerData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch buyer data:", error);
      }
    };

    fetchBuyerData();
    fetchTokens();
  }, [fetchTokens]);

  const handleTransferToken = async (e) => {
    e.preventDefault();

    if (!selectedTokenId || !transferToAddress.trim()) {
      alert("Please select a token and enter a recipient address");
      return;
    }

    try {
      await transferToken(selectedTokenId, transferToAddress);
      alert("Token transferred successfully!");
      setSelectedTokenId("");
      setTransferToAddress("");
    } catch (err) {
      console.error("Transfer failed:", err);
    }
  };

  const handleRetireToken = async (tokenId) => {
    if (
      window.confirm(
        "Are you sure you want to retire this token? This action cannot be undone."
      )
    ) {
      try {
        await retireToken(tokenId);
        alert("Token retired successfully!");
      } catch (err) {
        console.error("Retirement failed:", err);
      }
    }
  };

  const ownedTokens = (tokens || []).filter((token) => token && !token.isRetired);
  const retiredTokens = (tokens || []).filter((token) => token && token.isRetired);
  const portfolioValue = (ownedTokens.length * 85).toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  // Use actual market prices from buyerData if available, otherwise use sample data
  const marketPrices = buyerData?.marketPrices || [
    { type: 'Solar-Powered', price: 88.50, change: '+1.2%' },
    { type: 'Wind-Powered', price: 85.00, change: '-0.5%' },
    { type: 'Geothermal', price: 92.75, change: '+2.1%' }
  ];

  return (
    <div className="buyer-dashboard">
      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard 
          title="Owned Credits" 
          value={ownedTokens.length} 
          iconPath="M20 12V8H4v4" 
        />
        <StatCard 
          title="Retired Credits" 
          value={retiredTokens.length} 
          iconPath="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
          color="blue"
        />
        <StatCard 
          title="Total Credits" 
          value={(tokens || []).length} 
          iconPath="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" 
          color="purple"
        />
        <StatCard 
          title="Portfolio Value" 
          value={portfolioValue} 
          iconPath="M2 12h20M12 2v20" 
          color="amber"
        />
      </div>

      <div className="dashboard-grid">
        {/* My Tokens */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>My Credits ({ownedTokens.length})</h3>
          </div>
          <div className="card-content scrollable">
            {ownedTokens.length === 0 ? (
              <p className="empty-state">No credits found. Purchase some credits to get started!</p>
            ) : (
              ownedTokens.map((token) => (
                <div key={token.tokenId} className="token-item">
                  <div className="token-info">
                    <div>
                      <strong>Token #{token.tokenId}</strong>
                      <br />
                      <span>Factory: {token.factoryId || 'Unknown'}</span>
                      <br />
                      <span>
                        Created:{" "}
                        {token.creationTimestamp ? new Date(token.creationTimestamp).toLocaleDateString() : 'Unknown'}
                      </span>
                      <br />
                      <span>Creator: {token.creator ? token.creator.slice(0, 10) + '...' : 'Unknown'}</span>
                      <br />
                      <span>
                        Purchased:{" "}
                        {token.lastTransferTimestamp ? new Date(token.lastTransferTimestamp).toLocaleDateString() : 'Unknown'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRetireToken(token.tokenId)}
                      className="btn-retire"
                    >
                      Retire
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transfer Token */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Transfer Credit</h3>
          </div>
          <div className="card-content">
            <form onSubmit={handleTransferToken}>
              <div className="form-group">
                <label htmlFor="tokenSelect">Select Token:</label>
                <select
                  id="tokenSelect"
                  value={selectedTokenId}
                  onChange={(e) => setSelectedTokenId(e.target.value)}
                  required
                >
                  <option value="">Choose a token...</option>
                  {ownedTokens.map((token) => (
                    <option key={token.tokenId} value={token.tokenId}>
                      Token #{token.tokenId} - {token.factoryId}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="transferAddress">Recipient Address:</label>
                <input
                  type="text"
                  id="transferAddress"
                  value={transferToAddress}
                  onChange={(e) => setTransferToAddress(e.target.value)}
                  placeholder="0x..."
                  required
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || ownedTokens.length === 0}
              >
                {loading ? "Transferring..." : "Transfer Token"}
              </button>
            </form>

            {error && (
              <div className="error-message">
                Error: {error}
              </div>
            )}
          </div>
        </div>

        {/* Market Prices */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Current Market Prices</h3>
          </div>
          <div className="card-content">
            {marketPrices.map((price, index) => (
              <div key={index} className="market-item">
                <div>
                  <strong>{price.type}</strong>
                  <br />
                  <span>${price.price}/credit</span>
                </div>
                <span className={`price-change ${price.change.startsWith("+") ? 'positive' : 'negative'}`}>
                  {price.change}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Retired Tokens */}
        {retiredTokens.length > 0 && (
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Retired Credits ({retiredTokens.length})</h3>
            </div>
            <div className="card-content scrollable">
              {retiredTokens.map((token) => (
                <div key={token.tokenId} className="retired-token-item">
                  <strong>Token #{token.tokenId}</strong>
                  <br />
                  <span>Factory: {token.factoryId}</span>
                  <br />
                  <span>
                    Retired:{" "}
                    {new Date(token.retirementTimestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .buyer-dashboard {
          padding: 20px;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(240, 255, 240, 0.8) 100%);
          backdrop-filter: blur(10px);
          min-height: 100vh;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(5px);
          border-radius: 16px;
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0, 100, 0, 0.1);
          border: 1px solid rgba(46, 125, 50, 0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 100, 0, 0.15);
        }
        
        .stat-content {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .stat-text {
          display: flex;
          flex-direction: column;
        }
        
        .stat-title {
          color: #666;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 8px;
        }
        
        .stat-value {
          color: #2e7d32;
          font-size: 28px;
          font-weight: 700;
        }
        
        .stat-icon {
          padding: 10px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .dashboard-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 25px;
        }
        
        .dashboard-card {
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(5px);
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 100, 0, 0.1);
          border: 1px solid rgba(46, 125, 50, 0.2);
          transition: transform 0.3s ease;
        }
        
        .dashboard-card:hover {
          transform: translateY(-3px);
        }
        
        .card-header {
          padding: 20px;
          background: linear-gradient(90deg, #2e7d32 0%, #4caf50 100%);
          color: white;
        }
        
        .card-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .card-content {
          padding: 20px;
        }
        
        .scrollable {
          max-height: 400px;
          overflow-y: auto;
        }
        
        .form-group {
          margin-bottom: 20px;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }
        
        .form-group input,
        .form-group select {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.8);
          font-size: 14px;
          transition: all 0.3s ease;
        }
        
        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: #4caf50;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.2);
        }
        
        .btn-primary {
          background: linear-gradient(90deg, #2e7d32 0%, #4caf50 100%);
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          width: 100%;
        }
        
        .btn-primary:hover:not(:disabled) {
          box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
          transform: translateY(-2px);
        }
        
        .btn-primary:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }
        
        .btn-retire {
          background: #f44336;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        
        .btn-retire:hover {
          background: #d32f2f;
          transform: translateY(-2px);
        }
        
        .token-item,
        .retired-token-item,
        .market-item {
          padding: 15px;
          border: 1px solid #eee;
          border-radius: 8px;
          margin-bottom: 12px;
          background: rgba(255, 255, 255, 0.5);
          transition: all 0.3s ease;
        }
        
        .token-item:hover,
        .market-item:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
          transform: translateY(-2px);
        }
        
        .retired-token-item {
          opacity: 0.7;
          background: #f5f5f5;
        }
        
        .token-info {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        
        .market-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .price-change.positive {
          color: #2e7d32;
          font-weight: bold;
        }
        
        .price-change.negative {
          color: #f44336;
          font-weight: bold;
        }
        
        .success-message {
          margin-top: 15px;
          padding: 12px;
          background: rgba(76, 175, 80, 0.1);
          border: 1px solid rgba(76, 175, 80, 0.3);
          border-radius: 8px;
          color: #2e7d32;
        }
        
        .error-message {
          margin-top: 15px;
          padding: 12px;
          background: rgba(244, 67, 54, 0.1);
          border: 1px solid rgba(244, 67, 54, 0.3);
          border-radius: 8px;
          color: #d32f2f;
        }
        
        .empty-state {
          text-align: center;
          color: #777;
          font-style: italic;
          padding: 30px 0;
        }
        
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .dashboard-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default BuyerDashboard;