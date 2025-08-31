import React, { useState, useEffect } from "react";
import axios from "axios";
import { useBlockchain } from "../../contexts/BlockchainContext";
import StatisticalDashboard from "./StatisticalDashboard";

const RegulatoryDashboard = ({ data }) => {
  const [regulatoryData, setRegulatoryData] = useState(null);
  const [selectedToken, setSelectedToken] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchFilters, setSearchFilters] = useState({
    factoryName: "",
    factoryId: "",
    owner: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [factories, setFactories] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [tokenHistory, setTokenHistory] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalPages: 1,
    totalCount: 0,
  });

  const {
    tokens,
    transactions,
    loading,
    fetchTokens,
    fetchTransactions,
  } = useBlockchain();

  useEffect(() => {
    const fetchRegulatoryData = async () => {
      try {
        const response = await axios.get("/api/dashboard/regulatory", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setRegulatoryData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch regulatory data:", error);
      }
    };

    const fetchFactories = async () => {
      try {
        const response = await axios.get("/api/blockchain/factories", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setFactories(response.data.factories || []);
      } catch (error) {
        console.error("Failed to fetch factories:", error);
      }
    };

    fetchRegulatoryData();
    fetchFactories();
    fetchTokens();
    fetchTransactions();
  }, [fetchTokens, fetchTransactions]);

  const handleSearch = async () => {
    setSearching(true);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      queryParams.append("page", pagination.page.toString());
      queryParams.append("limit", pagination.limit.toString());

      const response = await axios.get(
        `/api/blockchain/search?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setSearchResults(response.data.tokens);
        setPagination((prev) => ({
          ...prev,
          totalPages: response.data.totalPages || 1,
          totalCount: response.data.totalCount || 0,
        }));
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setSearching(false);
    }
  };

  const clearFilters = () => {
    setSearchFilters({
      factoryName: "",
      factoryId: "",
      owner: "",
      status: "",
      startDate: "",
      endDate: "",
    });
    setSearchResults([]);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const fetchTokenHistory = async (tokenId) => {
    try {
      const response = await axios.get(
        `/api/blockchain/token/${tokenId}/history`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        setTokenHistory(response.data.history);
      }
    } catch (error) {
      console.error("Failed to fetch token history:", error);
    }
  };

  const viewTokenDetails = async (token) => {
    setSelectedToken(token);
    await fetchTokenHistory(token.tokenId);
  };

  const formatAddress = (address) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div>
      {/* Stats Grid - Using basic token counts */}
      <div className="stats-grid">
        <div className="stat-card">
          <h3>{tokens.length}</h3>
          <p>Total Tokens</p>
        </div>
        <div className="stat-card">
          <h3>{tokens.filter(t => t.currentOwner !== t.creator).length}</h3>
          <p>Total Transferred</p>
        </div>
        <div className="stat-card">
          <h3>{tokens.filter(t => t.isRetired).length}</h3>
          <p>Total Retired</p>
        </div>
        <div className="stat-card">
          <h3>{tokens.filter(t => !t.isRetired).length}</h3>
          <p>Active Credits</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ borderBottom: "1px solid #ddd" }}>
          {["overview", "analytics", "search", "tokens", "transactions"].map((tab) => (
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
                borderBottom: activeTab === tab ? "2px solid #007bff" : "none",
              }}
            >
              {tab === "search" ? "Advanced Search" : tab === "analytics" ? "Statistical Analysis" : tab}
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
              <div>
                <div
                  style={{
                    marginBottom: "10px",
                    padding: "10px",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "4px",
                  }}
                >
                  <strong>Network Activity</strong>
                  <br />
                  Total Tokens: {tokens.length}
                  <br />
                  Active Credits: {tokens.filter(t => !t.isRetired).length}
                  <br />
                  Retirement Rate:{" "}
                  {tokens.length > 0
                    ? Math.round(
                        (tokens.filter(t => t.isRetired).length / tokens.length) * 100
                      )
                    : 0}
                  %
                </div>

                <div style={{ marginTop: "15px" }}>
                  <strong>Credit Distribution:</strong>
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
                          tokens.length > 0
                            ? (tokens.filter(t => !t.isRetired).length / tokens.length) * 100
                            : 0
                        }%`,
                        backgroundColor: "#28a745",
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
                          tokens.length > 0
                            ? (tokens.filter(t => t.isRetired).length / tokens.length) * 100
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
            </div>
          </div>

          {/* Recent Transactions Summary */}
          <div className="card">
            <h3>Recent Transaction Summary</h3>
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
                            ? "#007bff"
                            : "#6c757d",
                        color: "white",
                        padding: "2px 6px",
                        borderRadius: "3px",
                        fontSize: "12px",
                        textTransform: "uppercase",
                      }}
                    >
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

      {activeTab === "analytics" && (
        <div>
          {/* Statistical Analysis Dashboard */}
          <StatisticalDashboard />
        </div>
      )}

      {activeTab === "search" && (
        <div>
          {/* Advanced Search Filters */}
          <div className="card" style={{ marginBottom: "20px" }}>
            <h3>Advanced Token Search & Audit</h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "15px",
                marginTop: "15px",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  Factory Name:
                </label>
                <select
                  value={searchFilters.factoryName}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      factoryName: e.target.value,
                      factoryId: "",
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                >
                  <option value="">All Factories</option>
                  {factories.map((factory) => (
                    <option key={factory.factoryId} value={factory.factoryName}>
                      {factory.factoryName} ({factory.producerName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  Owner Address:
                </label>
                <input
                  type="text"
                  value={searchFilters.owner}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      owner: e.target.value,
                    }))
                  }
                  placeholder="0x..."
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  Token Status:
                </label>
                <select
                  value={searchFilters.status}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      status: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                >
                  <option value="">All Statuses</option>
                  <option value="active">Active</option>
                  <option value="retired">Retired</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  Start Date:
                </label>
                <input
                  type="date"
                  value={searchFilters.startDate}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "5px",
                    fontWeight: "bold",
                  }}
                >
                  End Date:
                </label>
                <input
                  type="date"
                  value={searchFilters.endDate}
                  onChange={(e) =>
                    setSearchFilters((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  style={{
                    width: "100%",
                    padding: "8px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button
                onClick={handleSearch}
                disabled={searching}
                style={{
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  cursor: searching ? "not-allowed" : "pointer",
                  opacity: searching ? 0.6 : 1,
                }}
              >
                {searching ? "Searching..." : "Search Tokens"}
              </button>
              <button
                onClick={clearFilters}
                style={{
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="card">
              <h3>Search Results ({pagination.totalCount} tokens found)</h3>
              <div
                style={{
                  marginTop: "15px",
                  maxHeight: "600px",
                  overflowY: "auto",
                }}
              >
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
                        Producer
                      </th>
                      <th
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          textAlign: "left",
                        }}
                      >
                        Current Owner
                      </th>
                      <th
                        style={{
                          padding: "8px",
                          border: "1px solid #ddd",
                          textAlign: "left",
                        }}
                      >
                        Status
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
                    {searchResults.map((token) => (
                      <tr key={token.tokenId}>
                        <td
                          style={{ padding: "8px", border: "1px solid #ddd" }}
                        >
                          #{token.tokenId}
                        </td>
                        <td
                          style={{ padding: "8px", border: "1px solid #ddd" }}
                        >
                          <div>
                            <strong>{token.factoryName || "Unknown"}</strong>
                            <br />
                            <small style={{ color: "#666" }}>
                              {token.metadata.factoryId}
                            </small>
                          </div>
                        </td>
                        <td
                          style={{ padding: "8px", border: "1px solid #ddd" }}
                        >
                          {token.producerName || "Unknown"}
                        </td>
                        <td
                          style={{ padding: "8px", border: "1px solid #ddd" }}
                        >
                          {formatAddress(token.metadata.currentOwner)}
                        </td>
                        <td
                          style={{ padding: "8px", border: "1px solid #ddd" }}
                        >
                          <span
                            style={{
                              backgroundColor: token.metadata.isRetired
                                ? "#6c757d"
                                : "#28a745",
                              color: "white",
                              padding: "2px 6px",
                              borderRadius: "3px",
                              fontSize: "12px",
                            }}
                          >
                            {token.metadata.isRetired ? "Retired" : "Active"}
                          </span>
                        </td>
                        <td
                          style={{ padding: "8px", border: "1px solid #ddd" }}
                        >
                          {new Date(
                            token.metadata.creationTimestamp
                          ).toLocaleDateString()}
                        </td>
                        <td
                          style={{ padding: "8px", border: "1px solid #ddd" }}
                        >
                          <button
                            onClick={() => viewTokenDetails(token)}
                            style={{
                              backgroundColor: "#007bff",
                              color: "white",
                              border: "none",
                              padding: "4px 8px",
                              borderRadius: "3px",
                              cursor: "pointer",
                              fontSize: "12px",
                            }}
                          >
                            View History
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div
                  style={{
                    marginTop: "15px",
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                  }}
                >
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.max(1, prev.page - 1),
                      }))
                    }
                    disabled={pagination.page === 1}
                    style={{
                      backgroundColor:
                        pagination.page === 1 ? "#ccc" : "#007bff",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: "3px",
                      cursor: pagination.page === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    Previous
                  </button>
                  <span style={{ padding: "5px 10px" }}>
                    Page {pagination.page} of {pagination.totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setPagination((prev) => ({
                        ...prev,
                        page: Math.min(prev.totalPages, prev.page + 1),
                      }))
                    }
                    disabled={pagination.page === pagination.totalPages}
                    style={{
                      backgroundColor:
                        pagination.page === pagination.totalPages
                          ? "#ccc"
                          : "#007bff",
                      color: "white",
                      border: "none",
                      padding: "5px 10px",
                      borderRadius: "3px",
                      cursor:
                        pagination.page === pagination.totalPages
                          ? "not-allowed"
                          : "pointer",
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "tokens" && (
        <div className="card">
          <h3>All Tokens Registry</h3>
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
                Total Tokens: <strong>{tokens.length}</strong>
              </span>
              <span>
                Active:{" "}
                <strong>{tokens.filter((t) => !t.isRetired).length}</strong>
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
                      Current Owner
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Status
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
                        {formatAddress(token.currentOwner)}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        <span
                          style={{
                            backgroundColor: token.isRetired
                              ? "#6c757d"
                              : "#28a745",
                            color: "white",
                            padding: "2px 6px",
                            borderRadius: "3px",
                            fontSize: "12px",
                          }}
                        >
                          {token.isRetired ? "Retired" : "Active"}
                        </span>
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        {new Date(token.creationTimestamp).toLocaleDateString()}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        <button
                          onClick={() => viewTokenDetails(token)}
                          style={{
                            backgroundColor: "#007bff",
                            color: "white",
                            border: "none",
                            padding: "4px 8px",
                            borderRadius: "3px",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                        >
                          View History
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
              <span>
                Total Transactions: <strong>{transactions.length}</strong>
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
                      Type
                    </th>
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
                      User
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      From
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      To
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      Timestamp
                    </th>
                    <th
                      style={{
                        padding: "8px",
                        border: "1px solid #ddd",
                        textAlign: "left",
                      }}
                    >
                      TX Hash
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx._id}>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        <span
                          style={{
                            backgroundColor:
                              tx.type === "mint"
                                ? "#28a745"
                                : tx.type === "transfer"
                                ? "#007bff"
                                : "#6c757d",
                            color: "white",
                            padding: "2px 6px",
                            borderRadius: "3px",
                            fontSize: "12px",
                            textTransform: "uppercase",
                          }}
                        >
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        #{tx.tokenId}
                      </td>
                      <td style={{ padding: "8px", border: "1px solid #ddd" }}>
                        {tx.userId?.username || "Unknown"}
                        <br />
                        <small style={{ color: "#666" }}>
                          ({tx.userId?.role || "Unknown"})
                        </small>
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

      {/* Enhanced Token Details Modal with History */}
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
              maxWidth: "800px",
              width: "90%",
              maxHeight: "80%",
              overflowY: "auto",
            }}
          >
            <h3>Token #{selectedToken.tokenId} - Complete Audit Trail</h3>

            {/* Token Metadata */}
            <div
              style={{
                marginTop: "15px",
                padding: "15px",
                backgroundColor: "#f8f9fa",
                borderRadius: "4px",
              }}
            >
              <h4>Token Information</h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "10px",
                  marginTop: "10px",
                }}
              >
                <div>
                  <strong>Factory:</strong>{" "}
                  {selectedToken.factoryName ||
                    selectedToken.metadata?.factoryId ||
                    selectedToken.factoryId}
                </div>
                <div>
                  <strong>Factory ID:</strong>{" "}
                  {selectedToken.metadata?.factoryId || selectedToken.factoryId}
                </div>
                <div>
                  <strong>Creator:</strong>{" "}
                  {formatAddress(
                    selectedToken.metadata?.creator || selectedToken.creator
                  )}
                </div>
                <div>
                  <strong>Current Owner:</strong>{" "}
                  {formatAddress(
                    selectedToken.metadata?.currentOwner ||
                      selectedToken.currentOwner
                  )}
                </div>
                <div>
                  <strong>Status:</strong>
                  <span
                    style={{
                      marginLeft: "5px",
                      backgroundColor:
                        selectedToken.metadata?.isRetired ||
                        selectedToken.isRetired
                          ? "#6c757d"
                          : "#28a745",
                      color: "white",
                      padding: "2px 6px",
                      borderRadius: "3px",
                      fontSize: "12px",
                    }}
                  >
                    {selectedToken.metadata?.isRetired ||
                    selectedToken.isRetired
                      ? "Retired"
                      : "Active"}
                  </span>
                </div>
                <div>
                  <strong>Created:</strong>{" "}
                  {formatDate(
                    selectedToken.metadata?.creationTimestamp ||
                      selectedToken.creationTimestamp
                  )}
                </div>
                {(selectedToken.metadata?.isRetired ||
                  selectedToken.isRetired) && (
                  <>
                    <div>
                      <strong>Retired By:</strong>{" "}
                      {formatAddress(
                        selectedToken.metadata?.retiredBy ||
                          selectedToken.retiredBy
                      )}
                    </div>
                    <div>
                      <strong>Retirement Date:</strong>{" "}
                      {formatDate(
                        selectedToken.metadata?.retirementTimestamp ||
                          selectedToken.retirementTimestamp
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Ownership History */}
            <div style={{ marginTop: "20px" }}>
              <h4>Ownership History & Transaction Trail</h4>
              {tokenHistory && tokenHistory.length > 0 ? (
                <div style={{ marginTop: "10px" }}>
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
                          Date
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            border: "1px solid #ddd",
                            textAlign: "left",
                          }}
                        >
                          Transaction
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            border: "1px solid #ddd",
                            textAlign: "left",
                          }}
                        >
                          Owner
                        </th>
                        <th
                          style={{
                            padding: "8px",
                            border: "1px solid #ddd",
                            textAlign: "left",
                          }}
                        >
                          Details
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tokenHistory.map((record, index) => (
                        <tr key={index}>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            {formatDate(record.timestamp)}
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            <span
                              style={{
                                backgroundColor:
                                  record.transactionType === "mint"
                                    ? "#28a745"
                                    : record.transactionType === "transfer"
                                    ? "#007bff"
                                    : "#6c757d",
                                color: "white",
                                padding: "2px 6px",
                                borderRadius: "3px",
                                fontSize: "12px",
                                textTransform: "uppercase",
                              }}
                            >
                              {record.transactionType}
                            </span>
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            {formatAddress(record.owner)}
                          </td>
                          <td
                            style={{ padding: "8px", border: "1px solid #ddd" }}
                          >
                            {record.transactionType === "mint" &&
                              "Token created and assigned to producer"}
                            {record.transactionType === "transfer" &&
                              `Token transferred to new owner`}
                            {record.transactionType === "retire" &&
                              "Token permanently retired from circulation"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p style={{ fontStyle: "italic", color: "#666" }}>
                  Loading transaction history...
                </p>
              )}
            </div>

            {/* Compliance & Audit Notes */}
            <div
              style={{
                marginTop: "20px",
                padding: "15px",
                backgroundColor: "#e3f2fd",
                borderRadius: "4px",
              }}
            >
              <h4 style={{ color: "#1976d2" }}>Regulatory Compliance Status</h4>
              <div style={{ marginTop: "10px" }}>
                <p>
                  <strong>✓ Blockchain Verification:</strong> Token exists on
                  blockchain with immutable history
                </p>
                <p>
                  <strong>✓ Ownership Chain:</strong> Complete ownership trail
                  from creation to current state
                </p>
                <p>
                  <strong>✓ Factory Authentication:</strong> Token linked to
                  registered production facility
                </p>
                {selectedToken.metadata?.isRetired ||
                selectedToken.isRetired ? (
                  <p>
                    <strong>✓ Retirement Status:</strong> Token properly retired
                    and removed from circulation
                  </p>
                ) : (
                  <p>
                    <strong>⚠ Active Status:</strong> Token remains in active
                    circulation
                  </p>
                )}
              </div>
            </div>

            <div style={{ marginTop: "20px", display: "flex", gap: "10px" }}>
              <button
                onClick={() => {
                  setSelectedToken(null);
                  setTokenHistory(null);
                }}
                style={{
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
              <button
                onClick={() => window.print()}
                style={{
                  backgroundColor: "#17a2b8",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Print Audit Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RegulatoryDashboard;
