import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import axios from "axios";

// Individual dashboard components
import ProducerDashboard from "./ProducerDashboard";
import RegulatoryDashboard from "./RegulatoryDashboard";
import BuyerDashboard from "./BuyerDashboard";
import CertificationDashboard from "./CertificationDashboard";

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          setError("No authentication token found. Please log in again.");
          setLoading(false);
          return;
        }

        const response = await axios.get("/api/dashboard/data", {
          headers: {
            Authorization: `Bearer ${token}`, // ✅ fixed interpolation
          },
        });

        setDashboardData(response.data.data);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
        setError("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <h3>Loading dashboard...</h3>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  // Route to specific dashboard based on user role
  const renderDashboard = () => {
    switch (user?.role) {
      case "Green Hydrogen Producer":
        return <ProducerDashboard data={dashboardData} />;
      case "Regulatory Authority":
        return <RegulatoryDashboard data={dashboardData} />;
      case "Industry Buyer":
        return <BuyerDashboard data={dashboardData} />;
      case "Certification Body":
        return <CertificationDashboard data={dashboardData} />;
      default:
        return (
          <div className="card">
            <h2>Unknown Role</h2>
            <p>
              Your role "{user?.role}" is not recognized. Please contact support.
            </p>
            <p>
              Available roles: Green Hydrogen Producer, Regulatory Authority,
              Industry Buyer, Certification Body
            </p>
          </div>
        );
    }
  };

  return (
    <div className="container">
      {dashboardData && (
        <div>
          <h1 style={{ marginBottom: "30px" }}>{dashboardData.title}</h1>
          <div className="alert alert-success" style={{ marginBottom: "30px" }}>
            {dashboardData.welcomeMessage}
          </div>
          {renderDashboard()}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
