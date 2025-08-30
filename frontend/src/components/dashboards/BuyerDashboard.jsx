import React, { useState, useEffect } from "react";
import axios from "axios";

const BuyerDashboard = ({ data }) => {
  const [buyerData, setBuyerData] = useState(null);

  useEffect(() => {
    const fetchBuyerData = async () => {
      try {
        const response = await axios.get("/api/dashboard/buyer");
        setBuyerData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch buyer data:", error);
      }
    };

    fetchBuyerData();
  }, []);

  return (
    <div>
      {/* Stats Grid */}
      <div className="stats-grid">
        {Object.entries(data.stats).map(([key, value]) => (
          <div key={key} className="stat-card">
            <h3>{value}</h3>
            <p>{key}</p>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
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

        {/* Portfolio Overview */}
        {buyerData && (
          <div className="card">
            <h3>Portfolio Overview</h3>
            <div style={{ marginTop: "15px" }}>
              <p>
                <strong>Total Credits:</strong>{" "}
                {buyerData.portfolio.totalCredits.toLocaleString()}
              </p>
              <p>
                <strong>Portfolio Value:</strong> $
                {buyerData.portfolio.value.toLocaleString()}
              </p>
              <p>
                <strong>Monthly Target:</strong>{" "}
                {buyerData.portfolio.monthlyTarget.toLocaleString()}
              </p>

              <div style={{ marginTop: "15px" }}>
                <p>
                  <strong>Progress to Monthly Target:</strong>
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
                      width: `${Math.min(
                        (1200 / buyerData.portfolio.monthlyTarget) * 100,
                        100
                      )}%`,
                      backgroundColor: "#007bff",
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
                      (1200 / buyerData.portfolio.monthlyTarget) * 100
                    )}
                    %
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recent Activities */}
        <div className="card">
          <h3>Recent Activities</h3>
          <ul className="activity-list">
            {data.recentActivities.map((activity, index) => (
              <li key={index}>{activity}</li>
            ))}
          </ul>
        </div>

        {/* Quick Actions */}
        <div className="card">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            {data.quickActions.map((action, index) => (
              <button key={index} className="btn">
                {action}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
