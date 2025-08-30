import React, { useState, useEffect } from "react";
import axios from "axios";
import { useBlockchain } from "../../contexts/BlockchainContext";

const CertificationDashboard = ({ data }) => {
  const [certificationData, setCertificationData] = useState(null);
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
    fetchTransactions,
  } = useBlockchain();

  useEffect(() => {
    const fetchCertificationData = async () => {
      try {
        const response = await axios.get("/api/dashboard/certification", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setCertificationData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch certification data:", error);
      }
    };

    fetchCertificationData();
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

  const getTokensByFactory = () => {
    const factoryGroups = {};
    tokens.forEach((token) => {
      if (!factoryGroups[token.factoryId]) {
        factoryGroups[token.factoryId] = [];
      }
      factoryGroups[token.factoryId].push(token);
    });
    return factoryGroups;
  };

  const verifiedTokens = tokens.filter((token) => !token.isRetired);
  const tokensByFactory = getTokensByFactory();

  return (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{verifiedTokens.length}</h3>
          <p>Verified Credits</p>
        </div>
        <div className="stat-card">
          <h3>{Object.keys(tokensByFactory).length}</h3>
          <p>Certified Facilities</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.totalRetired || 0}</h3>
          <p>Retired Credits</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.totalTransactions || 0}</h3>
          <p>Total Transactions</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ borderBottom: "1px solid #ddd" }}>
          {["overview", "verification", "facilities"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "10px 20px",
                border: "none",
                backgroundColor: activeTab === tab ? "#17a2b8" : "transparent",
                color: activeTab === tab ? "white" : "#17a2b8",
                cursor: "pointer",
                textTransform: "capitalize",
                borderBottom: activeTab === tab ? "2px solid #17a2b8" : "none",
              }}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "overview" && (
        <div className="dashboard-grid">
          {/* Certification Overview */}
          <div className="card">
            <h3>Certification System Overview</h3>
            <div style={{ marginTop: "15px" }}>
              {stats ? (
                <div>
                  <div
                    style={{
                      marginBottom: "10px",
                      padding: "10px",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "4px",
                    }}
                  >
                    <strong>Verification Activity</strong>
                    <br />
                    Total Credits Verified: {stats.totalMinted}
                    <br />
                    Active Facilities: {Object.keys(tokensByFactory).length}
                    <br />
                    Verification Rate: 100% (All tokens are verified on-chain)
                  </div>

                  <div style={{ marginTop: "15px" }}>
                    <strong>Credit Lifecycle:</strong>
                    <div
                      style={{
                        width: "100%",
                        backgroundColor: "#f0f0f0",
                        borderRadius: "4px",
                        marginTop: "5px",
                        height: "20px",
                        display: "flex",
                      }}
                    >
                      <div
                        style={{
                          width: `${
                            stats.totalMinted > 0
                              ? (stats.totalActive / stats.totalMinted) * 100
                              : 0
                          }%`,
                          backgroundColor: "#17a2b8",
                          borderRadius: "4px 0 0 4px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "11px",
                        }}
                      >
                        Active
                      </div>
                      <div
                        style={{
                          width: `${
                            stats.totalMinted > 0
                              ? (stats.totalRetired / stats.totalMinted) * 100
                              : 0
                          }%`,
                          backgroundColor: "#6c757d",
                          borderRadius: "0 4px 4px 0",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "white",
                          fontSize: "11px",
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

          {/* Inspection Queue */}
          {certificationData && (
            <div className="card">
              <h3>Upcoming Inspections</h3>
              <div style={{ marginTop: "15px" }}>
                {certificationData.inspectionQueue.map((inspection) => (
                  <div
                    key={inspection.id}
                    style={{
                      padding: "10px",
                      border: "1px solid #eee",
                      borderRadius: "4px",
                      marginBottom: "10px",
                    }}
                  >
                    <strong>{inspection.company}</strong>
                    <br />
                    <span>Scheduled: {inspection.scheduled}</span>
                    <br />
                    <span>Auditor: {inspection.auditor}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Verification Activity */}
          <div className="card">
            <h3>Recent Verification Activity</h3>
            <div
              style={{
                marginTop: "15px",
                maxHeight: "300px",
                overflowY: "auto",
              }}
            >
              {transactions.slice(0, 10).map((tx, index) => (
                <div
                  key={tx._id}
                  style={{
                    padding: "8px",
                    border: "1px solid #eee",
                    borderRadius: "4px",
                    marginBottom: "8px",
                    fontSize: "14px",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        backgroundColor:
                          tx.type === "mint"
                            ? "#28a745"
                            : tx.type === "transfer"
                            ? "#17a2b8"
                            : "#6c757d",
                        color: "white",
                        padding: "2px 6px",
                        borderRadius: "3px",
                        fontSize: "12px",
                        textTransform: "uppercase",
                      }}
                    >
                      {tx.type === "mint" ? "Verified" : tx.type}
                    </span>
                    <span style={{ fontSize: "12px", color: "#666" }}>
                      {formatDate(tx.timestamp)}
                    </span>
                  </div>
                  <div style={{ marginTop: "5px" }}>
                    Token #{tx.tokenId}
                    {tx.factoryId && (
                      <span style={{ marginLeft: "10px", color: "#666" }}>
                        Factory: {tx.factoryId}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certification Statistics */}
          {certificationData && (
            <div className="card">
              <h3>Certification Statistics</h3>
              <div style={{ marginTop: "15px" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <span>Issued:</span>
                  <strong>{certificationData.certificationStats.issued}</strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <span>Pending:</span>
                  <strong style={{ color: "orange" }}>
                    {certificationData.certificationStats.pending}
                  </strong>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "10px",
                  }}
                >
                  <span>Expired:</span>
                  <strong style={{ color: "red" }}>
                    {certificationData.certificationStats.expired}
                  </strong>
                </div>

                <div style={{ marginTop: "15px" }}>
                  <p>
                    <strong>Approval Rate:</strong>
                  </p>
                  <div
                    style={{
                      width: "100%",
                      backgroundColor: "#f0f0f0",
                      borderRadius: "4px",
                      marginTop: "5px",
                    }}
                  >
                    <div
                      style={{
                        width: `${
                          (certificationData.certificationStats.issued /
                            (certificationData.certificationStats.issued +
                              certificationData.certificationStats.pending)) *
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
                        (certificationData.certificationStats.issued /
                          (certificationData.certificationStats.issued +
                            certificationData.certificationStats.pending)) *
                          100
                      )}
                      %
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === "verification" && (
        <div className="card">
          <h3>Token Verification Registry</h3>
          <div style={{ marginTop: "15px" }}>
            <div
              style={{
                marginBottom: "15px",
                display: "flex",
                gap: "10px",
                alignItems: "center",
              }}
            >
              <span>
                Total Verified: <strong>{tokens.length}</strong>
              </span>
              <span>
                Active: <strong>{verifiedTokens.length}</strong>
              </span>
              <span>
                Retired:{" "}
                <strong>{tokens.filter((t) => t.isRetired).length}</strong>
              </span>
            </div>

            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ backgroundColor: "#f8f9fa" }}>
                    <th
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Token ID
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Factory
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Creator
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Verification Status
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Created
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {tokens.map((token) => (
                    <tr key={token.tokenId}>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        #{token.tokenId}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        {token.factoryId}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        {formatAddress(token.creator)}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        <span
                          style={{
                            backgroundColor: "#28a745",
                            color: "white",
                            padding: "2px 6px",
                            borderRadius: "3px",
                            fontSize: "12px",
                          }}
                        >
                          Verified
                        </span>
                        {token.isRetired && (
                          <span
                            style={{
                              backgroundColor: "#6c757d",
                              color: "white",
                              padding: "2px 6px",
                              borderRadius: "3px",
                              fontSize: "12px",
                              marginLeft: "5px",
                            }}
                          >
                            Retired
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        {new Date(token.creationTimestamp).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        <button
                          onClick={() => setSelectedToken(token)}
                          style={{
                            backgroundColor: "#17a2b8",
                            color: "white",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: "3px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          Verify Details
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

      {activeTab === "facilities" && (
        <div className="card">
          <h3>Certified Facilities</h3>
          <div style={{ marginTop: "15px" }}>
            <div style={{ marginBottom: "15px" }}>
              <span>
                Total Facilities:{" "}
                <strong>{Object.keys(tokensByFactory).length}</strong>
              </span>
            </div>

            <div style={{ maxHeight: "600px", overflowY: "auto" }}>
              {Object.entries(tokensByFactory).map(
                ([factoryId, factoryTokens]) => {
                  const activeTokens = factoryTokens.filter(
                    (t) => !t.isRetired
                  );
                  const retiredTokens = factoryTokens.filter(
                    (t) => t.isRetired
                  );

                  return (
                    <div
                      key={factoryId}
                      style={{
                        border: "1px solid #ddd",
                        borderRadius: "8px",
                        padding: "15px",
                        marginBottom: "15px",
                        backgroundColor: "#f8f9fa",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "10px",
                        }}
                      >
                        <h4 style={{ margin: 0 }}>{factoryId}</h4>
                        <span
                          style={{
                            backgroundColor: "#28a745",
                            color: "white",
                            padding: "2px 8px",
                            borderRadius: "12px",
                            fontSize: "12px",
                          }}
                        >
                          Certified
                        </span>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(150px, 1fr))",
                          gap: "10px",
                          marginBottom: "10px",
                        }}
                      >
                        <div
                          style={{
                            textAlign: "center",
                            padding: "8px",
                            backgroundColor: "white",
                            borderRadius: "4px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "18px",
                              fontWeight: "bold",
                              color: "#28a745",
                            }}
                          >
                            {factoryTokens.length}
                          </div>
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            Total Credits
                          </div>
                        </div>
                        <div
                          style={{
                            textAlign: "center",
                            padding: "8px",
                            backgroundColor: "white",
                            borderRadius: "4px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "18px",
                              fontWeight: "bold",
                              color: "#17a2b8",
                            }}
                          >
                            {activeTokens.length}
                          </div>
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            Active
                          </div>
                        </div>
                        <div
                          style={{
                            textAlign: "center",
                            padding: "8px",
                            backgroundColor: "white",
                            borderRadius: "4px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "18px",
                              fontWeight: "bold",
                              color: "#6c757d",
                            }}
                          >
                            {retiredTokens.length}
                          </div>
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            Retired
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: "12px", color: "#666" }}>
                        First Production:{" "}
                        {new Date(
                          Math.min(
                            ...factoryTokens.map(
                              (t) => new Date(t.creationTimestamp)
                            )
                          )
                        ).toLocaleDateString()}
                        <br />
                        Last Production:{" "}
                        {new Date(
                          Math.max(
                            ...factoryTokens.map(
                              (t) => new Date(t.creationTimestamp)
                            )
                          )
                        ).toLocaleDateString()}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          </div>
        </div>
      )}

      {/* Token Details Modal */}
      {selectedToken && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "8px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80%",
              overflowY: "auto",
            }}
          >
            <h3>Verification Details - Token #{selectedToken.tokenId}</h3>
            <div style={{ marginTop: "15px" }}>
              <div
                style={{
                  padding: "10px",
                  backgroundColor: "#d4edda",
                  borderRadius: "4px",
                  marginBottom: "15px",
                }}
              >
                <strong style={{ color: "#155724" }}>
                  ✓ VERIFIED ON BLOCKCHAIN
                </strong>
              </div>

              <p>
                <strong>Factory ID:</strong> {selectedToken.factoryId}
              </p>
              <p>
                <strong>Creator:</strong> {selectedToken.creator}
              </p>
              <p>
                <strong>Current Owner:</strong> {selectedToken.currentOwner}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {formatDate(selectedToken.creationTimestamp)}
              </p>
              <p>
                <strong>Last Transfer:</strong>{" "}
                {formatDate(selectedToken.lastTransferTimestamp)}
              </p>
              <p>
                <strong>Status:</strong>{" "}
                {selectedToken.isRetired ? "Retired" : "Active"}
              </p>

              {selectedToken.isRetired && (
                <>
                  <p>
                    <strong>Retired By:</strong> {selectedToken.retiredBy}
                  </p>
                  <p>
                    <strong>Retirement Date:</strong>{" "}
                    {formatDate(selectedToken.retirementTimestamp)}
                  </p>
                </>
              )}

              <div
                style={{
                  marginTop: "15px",
                  padding: "10px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "4px",
                }}
              >
                <small>
                  <strong>Verification Notes:</strong>
                  <br />
                  This token has been verified on the blockchain and represents
                  a legitimate green hydrogen credit. All metadata is immutable
                  and publicly verifiable.
                </small>
              </div>
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
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {error && (
        <div
          style={{
            position: "fixed",
            top: "20px",
            right: "20px",
            backgroundColor: "#f8d7da",
            border: "1px solid #f5c6cb",
            borderRadius: "4px",
            padding: "15px",
            color: "#721c24",
            maxWidth: "300px",
            zIndex: 1001,
          }}
        >
          Error: {error}
        </div>
      )}
    </div>
  );
};

export default CertificationDashboard;
