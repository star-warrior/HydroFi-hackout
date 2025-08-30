import React, { useState, useEffect } from "react";
import axios from "axios";

const RegulatoryDashboard = ({ data }) => {
  const [regulatoryData, setRegulatoryData] = useState(null);

  useEffect(() => {
    const fetchRegulatoryData = async () => {
      try {
        const response = await axios.get("/api/dashboard/regulatory");
        setRegulatoryData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch regulatory data:", error);
      }
    };

    fetchRegulatoryData();
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
        {/* Pending Applications */}
        {regulatoryData && (
          <div className="card">
            <h3>Pending Applications</h3>
            <div style={{ marginTop: "15px" }}>
              {regulatoryData.pendingApplications.map((app) => (
                <div
                  key={app.id}
                  style={{
                    padding: "10px",
                    border: "1px solid #eee",
                    borderRadius: "4px",
                    marginBottom: "10px",
                  }}
                >
                  <strong>{app.company}</strong>
                  <br />
                  <span>Type: {app.type}</span>
                  <br />
                  <span>Submitted: {app.submitted}</span>
                </div>
              ))}
            </div>
          </div>
        )}

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

export default RegulatoryDashboard;
