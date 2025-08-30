import React, { useState, useEffect } from "react";
import axios from "axios";

const ProducerDashboard = ({ data }) => {
  const [producerData, setProducerData] = useState(null);

  useEffect(() => {
    const fetchProducerData = async () => {
      try {
        const response = await axios.get("/api/dashboard/producer");
        setProducerData(response.data.data);
      } catch (error) {
        console.error("Failed to fetch producer data:", error);
      }
    };

    fetchProducerData();
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

        {/* Carbon Credits */}
        {producerData && (
          <div className="card">
            <h3>Carbon Credits Overview</h3>
            <div style={{ marginTop: "15px" }}>
              <p>
                <strong>Generated:</strong>{" "}
                {producerData.carbonCredits.generated}
              </p>
              <p>
                <strong>Sold:</strong> {producerData.carbonCredits.sold}
              </p>
              <p>
                <strong>Available:</strong>{" "}
                {producerData.carbonCredits.available}
              </p>
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

export default ProducerDashboard;
