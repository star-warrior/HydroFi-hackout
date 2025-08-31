import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useBlockchain } from "../../contexts/BlockchainContext";
import WalletHelper from "../WalletHelper";
import EnhancedTransferComponent from "../EnhancedTransferComponent";

const ProducerDashboard = ({ data }) => {
  const [producerData, setProducerData] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mintingSuccess, setMintingSuccess] = useState(null);
  const [transferData, setTransferData] = useState({
    tokenId: "",
    recipientAddress: "",
  });
  const [transferSuccess, setTransferSuccess] = useState(null);
  const [transferError, setTransferError] = useState(null);
  const [transferMethod, setTransferMethod] = useState("identifier");
  const [retiringTokenId, setRetiringTokenId] = useState(null);

  const { user } = useAuth();
  const { tokens, loading, error, mintTokens, fetchTokens, retireToken } =
    useBlockchain();

  useEffect(() => {
    const fetchProducerData = async () => {
      try {
        const response = await axios.get("/api/dashboard/producer", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setProducerData(response.data.data);
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
        `Successfully minted ${result.mintedTokens.length} tokens for factory ${user.factoryId}!`
      );
      setQuantity(1);

      setTimeout(() => setMintingSuccess(null), 5000);
    } catch (err) {
      console.error("Minting failed:", err);
    }
  };

  const handleRetireToken = async (tokenId) => {
    if (
      window.confirm(
        "Are you sure you want to retire this token? This action cannot be undone."
      )
    ) {
      setRetiringTokenId(tokenId);
      try {
        await retireToken(tokenId);
        alert("Token retired successfully!");
        // Refresh tokens after retirement to update the UI
        await fetchTokens();
      } catch (err) {
        console.error("Retirement failed:", err);
        alert("Retirement failed. Please try again.");
      } finally {
        setRetiringTokenId(null);
      }
    }
  };

  const handleTransferToken = async (e) => {
    e.preventDefault();

    if (!transferData.tokenId || !transferData.recipientAddress) {
      setTransferError("Please fill in all fields");
      return;
    }

    const token = userTokens.find((t) => t.tokenId === transferData.tokenId);
    if (!token) {
      setTransferError("Token not found or you don't own this token");
      return;
    }

    try {
      const response = await axios.post(
        "/api/blockchain/transfer",
        {
          tokenId: transferData.tokenId,
          to: transferData.recipientAddress,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setTransferSuccess(
          `Token ${transferData.tokenId} transfer initiated successfully! Refreshing data...`
        );
        setTransferData({ tokenId: "", recipientAddress: "" });
        setTransferError(null);

        setTimeout(async () => {
          await fetchTokens();
          setTransferSuccess(
            `Token ${transferData.tokenId} transferred successfully!`
          );
          setTimeout(() => setTransferSuccess(null), 5000);
        }, 1000);
      } else {
        setTransferError(response.data.message || "Transfer failed");
      }
    } catch (error) {
      console.error("Transfer failed:", error);
      setTransferError(error.response?.data?.message || "Transfer failed");
    }
  };

  // Filter tokens based on ownership and retired status
  const userTokens = tokens.filter(
    (token) => !token.isRetired && token.currentOwner === user?.walletAddress
  );

  const transferredTokens = tokens.filter(
    (token) =>
      !token.isRetired &&
      token.creator === user?.walletAddress &&
      token.currentOwner !== user?.walletAddress
  );

  const retiredTokens = tokens.filter((token) => token.isRetired);

  return (
    <div className="producer-dashboard">
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🌿</div>
          <h3>{userTokens.length}</h3>
          <p>Active Credits</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">♻️</div>
          <h3>{retiredTokens.length}</h3>
          <p>Retired Credits</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">🔄</div>
          <h3>{tokens.length}</h3>
          <p>Total Minted</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <h3>
            {
              userTokens.filter((token) => token.creator !== token.currentOwner)
                .length
            }
          </h3>
          <p>Sold Credits</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Token Minting Section */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Generate Green Hydrogen Credits</h3>
          </div>
          <div className="card-content">
            {user?.factoryId && (
              <div className="factory-info">
                <strong>Factory:</strong> {user.factoryName}
                <br />
                <strong>Factory ID:</strong> {user.factoryId}
              </div>
            )}
            <form onSubmit={handleMintTokens}>
              <div className="form-group">
                <label htmlFor="quantity">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                  min="1"
                  max="10"
                />
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading || !user?.factoryId}
              >
                {loading
                  ? "Minting..."
                  : `Generate ${quantity} Credit${quantity > 1 ? "s" : ""}`}
              </button>
              {!user?.factoryId && (
                <p className="error-message">
                  Factory ID not assigned. Please contact admin.
                </p>
              )}
            </form>

            {mintingSuccess && (
              <div className="success-message">
                {mintingSuccess}
              </div>
            )}

            {error && (
              <div className="error-message">
                Error: {error}
              </div>
            )}
          </div>
        </div>

        {/* Token Transfer Section */}
        <div className="dashboard-card">
          <div className="card-header">
            <h3>Transfer Credits</h3>
          </div>
          <div className="card-content">
            <WalletHelper />

            {/* Transfer Method Toggle */}
            <div className="transfer-toggle">
              <label className="toggle-option">
                <input
                  type="radio"
                  value="identifier"
                  checked={transferMethod === "identifier"}
                  onChange={(e) => setTransferMethod(e.target.value)}
                />
                <span>Transfer by Username/Factory ID</span>
              </label>
              <label className="toggle-option">
                <input
                  type="radio"
                  value="address"
                  checked={transferMethod === "address"}
                  onChange={(e) => setTransferMethod(e.target.value)}
                />
                <span>Transfer by Wallet Address</span>
              </label>
            </div>

            {transferMethod === "identifier" ? (
              <EnhancedTransferComponent
                userTokens={userTokens}
                onTransferSuccess={async () => {
                  setTransferSuccess(
                    "Token transferred successfully! Refreshing data..."
                  );
                  setTimeout(async () => {
                    await fetchTokens();
                    setTransferSuccess("Token transferred successfully!");
                    setTimeout(() => setTransferSuccess(null), 5000);
                  }, 1000);
                }}
                onTransferError={(error) => {
                  setTransferError(error);
                  setTimeout(() => setTransferError(null), 5000);
                }}
              />
            ) : (
              <form onSubmit={handleTransferToken}>
                <div className="form-group">
                  <label htmlFor="tokenSelect">Select Token to Transfer:</label>
                  <select
                    id="tokenSelect"
                    value={transferData.tokenId}
                    onChange={(e) =>
                      setTransferData((prev) => ({
                        ...prev,
                        tokenId: e.target.value,
                      }))
                    }
                    required
                  >
                    <option value="">Select a token...</option>
                    {userTokens
                      .filter((token) => token.creator === token.currentOwner)
                      .map((token) => (
                        <option key={token.tokenId} value={token.tokenId}>
                          Token #{token.tokenId} - Factory: {token.factoryId}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="recipientAddress">
                    Recipient Wallet Address:
                  </label>
                  <input
                    type="text"
                    id="recipientAddress"
                    value={transferData.recipientAddress}
                    onChange={(e) =>
                      setTransferData((prev) => ({
                        ...prev,
                        recipientAddress: e.target.value,
                      }))
                    }
                    placeholder="0x..."
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={
                    loading ||
                    userTokens.filter(
                      (token) => token.creator === token.currentOwner
                    ).length === 0
                  }
                >
                  {loading ? "Transferring..." : "Transfer Token"}
                </button>
                {userTokens.filter(
                  (token) => token.creator === token.currentOwner
                ).length === 0 && (
                  <p className="error-message">
                    No transferable tokens available. You can only transfer tokens
                    you currently own.
                  </p>
                )}
              </form>
            )}

            {transferSuccess && (
              <div className="success-message">
                {transferSuccess}
              </div>
            )}

            {transferError && (
              <div className="error-message">
                Error: {transferError}
              </div>
            )}
          </div>
        </div>

        {/* My Tokens */}
        <div className="dashboard-card">
          <div className="card-header with-action">
            <h3>My Active Credits ({userTokens.length})</h3>
            <button
              onClick={async () => {
                setTransferSuccess("Refreshing tokens...");
                await fetchTokens();
                setTransferSuccess("Tokens refreshed!");
                setTimeout(() => setTransferSuccess(null), 2000);
              }}
              className="btn-refresh"
            >
              🔄 Refresh
            </button>
          </div>
          <div className="card-content scrollable">
            {userTokens.length === 0 ? (
              <p className="empty-state">
                No active tokens found. Generate some credits to get started!
              </p>
            ) : (
              userTokens.map((token) => (
                <div key={token.tokenId} className="token-item">
                  <div className="token-info">
                    <div>
                      <strong>Token #{token.tokenId}</strong>
                      <br />
                      <span>Factory: {token.factoryId}</span>
                      <br />
                      <span>
                        Created:{" "}
                        {new Date(token.creationTimestamp).toLocaleDateString()}
                      </span>
                      <br />
                      <span className={`status ${token.creator === token.currentOwner ? 'available' : 'sold'}`}>
                        Status:{" "}
                        {token.creator === token.currentOwner
                          ? "Available"
                          : "Sold"}
                      </span>
                      {token.creator !== token.currentOwner && (
                        <>
                          <br />
                          <span>
                            Owner: {token.currentOwner.slice(0, 10)}...
                          </span>
                        </>
                      )}
                    </div>
                    <button
                      onClick={() => handleRetireToken(token.tokenId)}
                      className="btn-retire"
                      disabled={retiringTokenId === token.tokenId}
                    >
                      {retiringTokenId === token.tokenId ? "Retiring..." : "Retire"}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Production Facilities */}
        {producerData && (
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Production Facilities</h3>
            </div>
            <div className="card-content">
              {producerData.productionFacilities.map((facility) => (
                <div key={facility.id} className="facility-item">
                  <strong>{facility.name}</strong>
                  <br />
                  <span>Capacity: {facility.capacity}</span>
                  <br />
                  <span className={`status ${facility.status === "Active" ? 'active' : 'inactive'}`}>
                    Status: {facility.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

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
        .producer-dashboard {
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
          text-align: center;
          box-shadow: 0 4px 15px rgba(0, 100, 0, 0.1);
          border: 1px solid rgba(46, 125, 50, 0.2);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 100, 0, 0.15);
        }
        
        .stat-icon {
          font-size: 24px;
          margin-bottom: 10px;
        }
        
        .stat-card h3 {
          margin: 10px 0;
          font-size: 28px;
          color: #2e7d32;
          font-weight: 700;
        }
        
        .stat-card p {
          margin: 0;
          color: #555;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 1px;
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
        
        .card-header.with-action {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .card-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
        }
        
        .card-content {
          padding: 20px;
        }
        
        .factory-info {
          margin: 10px 0 20px;
          padding: 12px;
          background: rgba(76, 175, 80, 0.1);
          border: 1px solid rgba(76, 175, 80, 0.3);
          border-radius: 8px;
          font-size: 14px;
          color: #2e7d32;
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
        
        .btn-refresh {
          background: rgba(255, 255, 255, 0.2);
          color: white;
          border: 1px solid rgba(255, 255, 255, 0.4);
          padding: 8px 12px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        
        .btn-refresh:hover {
          background: rgba(255, 255, 255, 0.3);
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
        
        .btn-retire:hover:not(:disabled) {
          background: #d32f2f;
          transform: translateY(-2px);
        }
        
        .btn-retire:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
        }
        
        .transfer-toggle {
          display: flex;
          gap: 20px;
          margin: 20px 0;
        }
        
        .toggle-option {
          display: flex;
          align-items: center;
          cursor: pointer;
        }
        
        .toggle-option input {
          margin-right: 8px;
        }
        
        .scrollable {
          max-height: 400px;
          overflow-y: auto;
        }
        
        .token-item,
        .facility-item,
        .retired-token-item {
          padding: 15px;
          border: 1px solid #eee;
          border-radius: 8px;
          margin-bottom: 12px;
          background: rgba(255, 255, 255, 0.5);
          transition: all 0.3s ease;
        }
        
        .token-item:hover,
        .facility-item:hover {
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
        
        .status.available {
          color: #2e7d32;
          font-weight: 500;
        }
        
        .status.sold {
          color: #ff9800;
          font-weight: 500;
        }
        
        .status.active {
          color: #2e7d32;
          font-weight: 500;
        }
        
        .status.inactive {
          color: #ff9800;
          font-weight: 500;
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
          
          .transfer-toggle {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default ProducerDashboard;