  import React, { useState, useEffect } from "react";
  import { useAuth } from "../../contexts/AuthContext";

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
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulated API
          const mockData = {
            title: `${user.role} Dashboard`,
          };
          setDashboardData(mockData);
        } catch (error) {
          setError("Failed to load dashboard data");
        } finally {
          setLoading(false);
        }
      };

      if (user) {
        fetchDashboardData();
      }
    }, [user]);

    if (loading) {
      return (
        <div className="p-8 text-center">
          <h3>Loading dashboard...</h3>
        </div>
      );
    }

    if (error) {
      return <div className="p-8 text-center text-red-500">{error}</div>;
    }

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
            <div className="p-6 text-center text-red-500">
              <h2>Unknown Role</h2>
              <p>Your role "{user?.role}" is not recognized.</p>
            </div>
          );
      }
    };

    return <>{renderDashboard()}</>;
  };

  export default Dashboard;
