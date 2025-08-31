import React, { useState, useEffect } from "react";
import axios from "axios";
import { useBlockchain } from "../../contexts/BlockchainContext";

const BuyerDashboard = ({ data }) => {
  const [buyerData, setBuyerData] = useState(null);
  const [transferToAddress, setTransferToAddress] = useState("");
  const [selectedTokenId, setSelectedTokenId] = useState("");

  const { tokens, loading, error, fetchTokens, transferToken, retireToken } =
    useBlockchain();

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

  const ownedTokens = (tokens || []).filter(
    (token) => token && !token.isRetired
  );
  const retiredTokens = (tokens || []).filter(
    (token) => token && token.isRetired
  );

  return (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{ownedTokens.length}</h3>
          <p>Owned Credits</p>
        </div>
        <div className="stat-card">
          <h3>{retiredTokens.length}</h3>
          <p>Retired Credits</p>
        </div>
        <div className="stat-card">
          <h3>{(tokens || []).length}</h3>
          <p>Total Credits</p>
        </div>
        <div className="stat-card">
          <h3>${(ownedTokens.length * 85).toLocaleString()}</h3>
          <p>Portfolio Value</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* My Tokens */}
        <div className="card">
          <h3>My Credits ({ownedTokens.length})</h3>
          <div
            style={{ marginTop: "15px", maxHeight: "400px", overflowY: "auto" }}
          >
            {ownedTokens.length === 0 ? (
              <p>No credits found. Purchase some credits to get started!</p>
            ) : (
              ownedTokens.map((token) => (
                <div
                  key={token.tokenId}
                  style={{
                    padding: "12px",
                    border: "1px solid #eee",
                    borderRadius: "4px",
                    marginBottom: "10px",
                    backgroundColor: "#f9f9f9",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                    }}
                  >
                    <div>
                      <strong>Token #{token.tokenId}</strong>
                      <br />
                      <span>Factory: {token.factoryId || "Unknown"}</span>
                      <br />
                      <span>
                        Created:{" "}
                        {token.creationTimestamp
                          ? new Date(
                              token.creationTimestamp
                            ).toLocaleDateString()
                          : "Unknown"}
                      </span>
                      <br />
                      <span>
                        Creator:{" "}
                        {token.creator
                          ? token.creator.slice(0, 10) + "..."
                          : "Unknown"}
                      </span>
                      <br />
                      <span>
                        Purchased:{" "}
                        {token.lastTransferTimestamp
                          ? new Date(
                              token.lastTransferTimestamp
                            ).toLocaleDateString()
                          : "Unknown"}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "5px",
                      }}
                    >
                      <button
                        onClick={() => handleRetireToken(token.tokenId)}
                        style={{
                          backgroundColor: "#dc3545",
                          color: "white",
                          border: "none",
                          padding: "5px 10px",
                          borderRadius: "4px",
                          cursor: "pointer",
                          fontSize: "12px",
                        }}
                      >
                        Retire
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Transfer Token */}
        <div className="card">
          <h3>Transfer Credit</h3>
          <form onSubmit={handleTransferToken} style={{ marginTop: "15px" }}>
            <div style={{ marginBottom: "15px" }}>
              <label
                htmlFor="tokenSelect"
                style={{ display: "block", marginBottom: "5px" }}
              >
                Select Token:
              </label>
              <select
                id="tokenSelect"
                value={selectedTokenId}
                onChange={(e) => setSelectedTokenId(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
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
            <div style={{ marginBottom: "15px" }}>
              <label
                htmlFor="transferAddress"
                style={{ display: "block", marginBottom: "5px" }}
              >
                Recipient Address:
              </label>
              <input
                type="text"
                id="transferAddress"
                value={transferToAddress}
                onChange={(e) => setTransferToAddress(e.target.value)}
                placeholder="0x..."
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
                required
              />
            </div>
            <button
              type="submit"
              className="btn"
              disabled={loading || ownedTokens.length === 0}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "4px",
                cursor:
                  loading || ownedTokens.length === 0
                    ? "not-allowed"
                    : "pointer",
                opacity: loading || ownedTokens.length === 0 ? 0.6 : 1,
              }}
            >
              {loading ? "Transferring..." : "Transfer Token"}
            </button>
          </form>

          {error && (
            <div
              style={{
                marginTop: "15px",
                padding: "10px",
                backgroundColor: "#f8d7da",
                border: "1px solid #f5c6cb",
                borderRadius: "4px",
                color: "#721c24",
              }}
            >
              Error: {error}
            </div>
          )}
        </div>

        {/* Market Prices */}
        {buyerData && (
          <div className="card">
            <h3>Current Market Prices</h3>
            <div style={{ marginTop: "15px" }}>
              {buyerData.marketPrices.map((price, index) => (
                <div
                  key={index}
                  style={{
                    padding: "10px",
                    border: "1px solid #eee",
                    borderRadius: "4px",
                    marginBottom: "10px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong>{price.type}</strong>
                    <br />
                    <span>${price.price}/credit</span>
                  </div>
                  <span
                    style={{
                      color: price.change.startsWith("+") ? "green" : "red",
                      fontWeight: "bold",
                    }}
                  >
                    {price.change}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Retired Tokens */}
        {retiredTokens.length > 0 && (
          <div className="card">
            <h3>Retired Credits ({retiredTokens.length})</h3>
            <div
              style={{
                marginTop: "15px",
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              {retiredTokens.map((token) => (
                <div
                  key={token.tokenId}
                  style={{
                    padding: "10px",
                    border: "1px solid #eee",
                    borderRadius: "4px",
                    marginBottom: "10px",
                    backgroundColor: "#f5f5f5",
                    opacity: 0.7,
                  }}
                >
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
    </div>
  );
};

export default BuyerDashboard;
