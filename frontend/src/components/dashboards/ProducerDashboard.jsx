import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../../contexts/AuthContext";
import { useBlockchain } from "../../contexts/BlockchainContext";

const ProducerDashboard = ({ data }) => {
  const [producerData, setProducerData] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [mintingSuccess, setMintingSuccess] = useState(null);

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

      // Clear success message after 5 seconds
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
      try {
        await retireToken(tokenId);
        alert("Token retired successfully!");
      } catch (err) {
        console.error("Retirement failed:", err);
      }
    }
  };

  const userTokens = tokens.filter((token) => !token.isRetired);
  const retiredTokens = tokens.filter((token) => token.isRetired);

  return (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{userTokens.length}</h3>
          <p>Active Credits</p>
        </div>
        <div className="stat-card">
          <h3>{retiredTokens.length}</h3>
          <p>Retired Credits</p>
        </div>
        <div className="stat-card">
          <h3>{tokens.length}</h3>
          <p>Total Minted</p>
        </div>
        <div className="stat-card">
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
        <div className="card">
          <h3>Generate Green Hydrogen Credits</h3>
          {user?.factoryId && (
            <div
              style={{
                marginTop: "10px",
                padding: "10px",
                backgroundColor: "#e3f2fd",
                border: "1px solid #bbdefb",
                borderRadius: "4px",
                marginBottom: "15px",
              }}
            >
              <strong>Factory:</strong> {user.factoryName}
              <br />
              <strong>Factory ID:</strong> {user.factoryId}
            </div>
          )}
          <form onSubmit={handleMintTokens} style={{ marginTop: "15px" }}>
            <div style={{ marginBottom: "15px" }}>
              <label
                htmlFor="quantity"
                style={{ display: "block", marginBottom: "5px" }}
              >
                Quantity:
              </label>
              <input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                min="1"
                max="10"
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                }}
              />
            </div>
            <button
              type="submit"
              className="btn"
              disabled={loading || !user?.factoryId}
              style={{
                backgroundColor: user?.factoryId ? "#4CAF50" : "#ccc",
                color: "white",
                padding: "10px 20px",
                border: "none",
                borderRadius: "4px",
                cursor: loading || !user?.factoryId ? "not-allowed" : "pointer",
                opacity: loading || !user?.factoryId ? 0.6 : 1,
              }}
            >
              {loading
                ? "Minting..."
                : `Generate ${quantity} Credit${quantity > 1 ? "s" : ""}`}
            </button>
            {!user?.factoryId && (
              <p
                style={{
                  marginTop: "10px",
                  color: "#d32f2f",
                  fontSize: "14px",
                }}
              >
                Factory ID not assigned. Please contact admin.
              </p>
            )}
          </form>

          {mintingSuccess && (
            <div
              style={{
                marginTop: "15px",
                padding: "10px",
                backgroundColor: "#d4edda",
                border: "1px solid #c3e6cb",
                borderRadius: "4px",
                color: "#155724",
              }}
            >
              {mintingSuccess}
            </div>
          )}

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

        {/* My Tokens */}
        <div className="card">
          <h3>My Active Credits ({userTokens.length})</h3>
          <div
            style={{ marginTop: "15px", maxHeight: "400px", overflowY: "auto" }}
          >
            {userTokens.length === 0 ? (
              <p>
                No active tokens found. Generate some credits to get started!
              </p>
            ) : (
              userTokens.map((token) => (
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
                      <span>Factory: {token.factoryId}</span>
                      <br />
                      <span>
                        Created:{" "}
                        {new Date(token.creationTimestamp).toLocaleDateString()}
                      </span>
                      <br />
                      <span
                        style={{
                          color:
                            token.creator === token.currentOwner
                              ? "green"
                              : "orange",
                        }}
                      >
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
              ))
            )}
          </div>
        </div>

        {/* Production Facilities */}
        {producerData && (
          <div className="card">
            <h3>Production Facilities</h3>
            <div style={{ marginTop: "15px" }}>
              {producerData.productionFacilities.map((facility) => (
                <div
                  key={facility.id}
                  style={{
                    padding: "10px",
                    border: "1px solid #eee",
                    borderRadius: "4px",
                    marginBottom: "10px",
                  }}
                >
                  <strong>{facility.name}</strong>
                  <br />
                  <span>Capacity: {facility.capacity}</span>
                  <br />
                  <span
                    style={{
                      color: facility.status === "Active" ? "green" : "orange",
                    }}
                  >
                    Status: {facility.status}
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

export default ProducerDashboard;
