import React, { useState, useEffect } from "react";
import axios from "axios";
import { useBlockchain } from "../../contexts/BlockchainContext";

const RegulatoryDashboard = ({ data }) => {
  const [regulatoryData, setRegulatoryData] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  
  const { 
    tokens, 
    transactions, 
    stats, 
    loading, 
    error, 
    fetchTokens, 
    fetchStats, 
    fetchTransactions 
  } = useBlockchain();

  useEffect(() => {
    const fetchRegulatoryData = async () => {
      try {
        const response = await axios.get("/api/dashboard/regulatory", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setRegulatoryData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch regulatory data:", error);
      }
    };

    fetchRegulatoryData();
    fetchTokens();
    fetchStats();
    fetchTransactions();
  }, [fetchTokens, fetchStats, fetchTransactions]);

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats?.totalMinted || 0}</h3>
          <p>Total Minted</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.totalTransferred || 0}</h3>
          <p>Total Transferred</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.totalRetired || 0}</h3>
          <p>Total Retired</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.totalActive || 0}</h3>
          <p>Active Credits</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ borderBottom: "1px solid #ddd" }}>
          {["overview", "tokens", "transactions"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 20px",
                border: "none",
                backgroundColor: activeTab === tab ? "#007bff" : "transparent",
                color: activeTab === tab ? "white" : "#007bff",
                cursor: "pointer",
                textTransform: "capitalize",
                borderBottom: activeTab === tab ? "2px solid #007bff" : "none"
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="dashboard-grid">
          {/* System Overview */}
          <div className="card">
            <h3>Blockchain System Overview</h3>
            <div style={{ marginTop: "15px" }}>
              {stats ? (
                <div>
                  <div style={{ marginBottom: "10px", padding: "10px", backgroundColor: "#f8f9fa", borderRadius: "4px" }}>
                    <strong>Network Activity</strong>
                    <br />
                    Total Transactions: {stats.totalTransactions}
                    <br />
                    Active Credits: {stats.totalActive}
                    <br />
                    Retirement Rate: {stats.totalMinted > 0 ? Math.round((stats.totalRetired / stats.totalMinted) * 100) : 0}%
                  </div>
                  
                  <div style={{ marginTop: "15px" }}>
                    <strong>Credit Distribution:</strong>
                    <div style={{ width: "100%", backgroundColor: "#f0f0f0", borderRadius: "4px", marginTop: "5px", height: "20px", display: "flex" }}>
                      <div
                        style={{
                          width: `${stats.totalMinted > 0 ? (stats.totalActive / stats.totalMinted) * 100 : 0}%`,
                          backgroundColor: "#28a745",
                          borderRadius: "4px 0 0 4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "11px"
                        }}
                      >
                        Active
                      </div>
                      <div
                        style={{
                          width: `${stats.totalMinted > 0 ? (stats.totalRetired / stats.totalMinted) * 100 : 0}%`,
                          backgroundColor: "#6c757d",
                          borderRadius: "0 4px 4px 0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "11px"
                        }}
                      >
                        Retired
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p>Loading statistics...</p>
              )}
            </div>
          </div>

          {/* Recent Transactions Summary */}
          <div className="card">
            <h3>Recent Transaction Summary</h3>
            <div style={{ marginTop: "15px", maxHeight: "300px", overflowY: "auto" }}>
              {transactions.slice(0, 10).map((tx, index) => (
                <div
                  key={tx._id}
                  style={{
                    padding: "8px",
                    border: "1px solid #eee",
                    borderRadius: "4px",
                    marginBottom: "8px",
                    fontSize: "14px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ 
                      backgroundColor: 
                        tx.type === "mint" ? "#28a745" : 
                        tx.type === "transfer" ? "#007bff" : "#6c757d",
                      color: "white",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      fontSize: "12px",
                      textTransform: "uppercase"
                    }}>
                      {tx.type}
                    </span>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      {formatDate(tx.timestamp)}
                    </span>
                  </div>
                  <div style={{ marginTop: "5px" }}>
                    Token #{tx.tokenId}
                    {tx.userId?.username && (
                      <span style={{ marginLeft: "10px", color: "#666" }}>
                        by {tx.userId.username}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Metrics */}
          {regulatoryData && (
            <div className="card">
              <h3>Compliance Overview</h3>
              <div style={{ marginTop: "15px" }}>
                <p>
                  <strong>Total Facilities:</strong>{" "}
                  {regulatoryData.complianceMetrics.totalFacilities}
                </p>
                <p>
                  <strong>Compliant:</strong>{" "}
                  {regulatoryData.complianceMetrics.compliant}
                </p>
                <p>
                  <strong>Under Review:</strong>{" "}
                  {regulatoryData.complianceMetrics.underReview}
                </p>
                <div
                  style={{
                    width: "100%",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "4px",
                    marginTop: "10px",
                  }}
                >
                  <div
                    style={{
                      width: `${
                        (regulatoryData.complianceMetrics.compliant /
                          regulatoryData.complianceMetrics.totalFacilities) *
                        100
                      }%`,
                      backgroundColor: "#28a745",
                      height: "20px",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontSize: "12px",
                    }}
                  >
                    {Math.round(
                      (regulatoryData.complianceMetrics.compliant /
                        regulatoryData.complianceMetrics.totalFacilities) *
                        100
                    )}
                    %
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "tokens" && (
        <div className="card">
          <h3>All Tokens Registry</h3>
          <div style={{ marginTop: "15px" }}>
            <div style={{ marginBottom: "15px", display: "flex", gap: "10px", alignItems: "center" }}>
              <span>Total Tokens: <strong>{tokens.length}</strong></span>
              <span>Active: <strong>{tokens.filter(t => !t.isRetired).length}</strong></span>
              <span>Retired: <strong>{tokens.filter(t => t.isRetired).length}</strong></span>
            </div>
            
            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>Token ID</th>
                    <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>Factory</th>
                    <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>Creator</th>
                    <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>Current Owner</th>
                    <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>Status</th>
                    <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>Created</th>
                    <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token) => (
                    <tr key={token.tokenId}>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>#{token.tokenId}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{token.factoryId}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{formatAddress(token.creator)}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{formatAddress(token.currentOwner)}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        <span style={{
                          backgroundColor: token.isRetired ? "#6c757d" : "#28a745",
                          color: "white",
                          padding: "2px 6px",
                          borderRadius: "3px",
                          fontSize: "12px"
                        }}>
                          {token.isRetired ? "Retired" : "Active"}
                        </span>
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        {new Date(token.creationTimestamp).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        <button
                          onClick={() => setSelectedToken(token)}
                          style={{
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: "3px",
                            cursor: "pointer",
                            fontSize: "12px"
                          }}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "transactions" && (
        <div className="card">
          <h3>Transaction History</h3>
          <div style={{ marginTop: "15px" }}>
            <div style={{ marginBottom: "15px" }}>
              <span>Total Transactions: <strong>{transactions.length}</strong></span>
            </div>
            
            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>Type</th>
                    <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>Token ID</th>
                    <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>User</th>
                    <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>From</th>
                    <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>To</th>
                    <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>Timestamp</th>
                    <th style={{ padding: "8px", border: "1px solid #ddd", textAlign: "left" }}>TX Hash</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        <span style={{
                          backgroundColor: 
                            tx.type === "mint" ? "#28a745" : 
                            tx.type === "transfer" ? "#007bff" : "#6c757d",
                          color: "white",
                          padding: "2px 6px",
                          borderRadius: "3px",
                          fontSize: "12px",
                          textTransform: "uppercase"
                        }}>
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>#{tx.tokenId}</td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        {tx.userId?.username || "Unknown"}
                        <br />
                        <small style={{ color: "#666" }}>({tx.userId?.role || "Unknown"})</small>
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        {tx.from ? formatAddress(tx.from) : "-"}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        {tx.to ? formatAddress(tx.to) : "-"}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        {formatDate(tx.timestamp)}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        <small>{formatAddress(tx.transactionHash)}</small>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Token Details Modal */}
      {selectedToken && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "20px",
            borderRadius: "8px",
            maxWidth: "500px",
            width: "90%",
            maxHeight: "80%",
            overflowY: "auto"
          }}>
            <h3>Token #{selectedToken.tokenId} Details</h3>
            <div style={{ marginTop: "15px" }}>
              <p><strong>Factory ID:</strong> {selectedToken.factoryId}</p>
              <p><strong>Creator:</strong> {selectedToken.creator}</p>
              <p><strong>Current Owner:</strong> {selectedToken.currentOwner}</p>
              <p><strong>Created:</strong> {formatDate(selectedToken.creationTimestamp)}</p>
              <p><strong>Last Transfer:</strong> {formatDate(selectedToken.lastTransferTimestamp)}</p>
              <p><strong>Status:</strong> {selectedToken.isRetired ? "Retired" : "Active"}</p>
              {selectedToken.isRetired && (
                <>
                  <p><strong>Retired By:</strong> {selectedToken.retiredBy}</p>
                  <p><strong>Retirement Date:</strong> {formatDate(selectedToken.retirementTimestamp)}</p>
                </>
              )}
            </div>
            <button
              onClick={() => setSelectedToken(null)}
              style={{
                marginTop: "15px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer"
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {error && (
        <div style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          backgroundColor: "#f8d7da",
          border: "1px solid #f5c6cb",
          borderRadius: "4px",
          padding: "15px",
          color: "#721c24",
          maxWidth: "300px",
          zIndex: 1001
        }}>
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default RegulatoryDashboard;
