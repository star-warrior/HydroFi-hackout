import React, { useState, useEffect } from "react";
import axios from "axios";

const CertificationDashboard = ({ data }) => {
  const [certificationData, setCertificationData] = useState(null);

  useEffect(() => {
    const fetchCertificationData = async () => {
      try {
        const response = await axios.get("/api/dashboard/certification");
        setCertificationData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch certification data:", error);
      }
    };

    fetchCertificationData();
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

              {/* Success Rate */}
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

export default CertificationDashboard;
