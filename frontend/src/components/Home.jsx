import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="container">
      <div className="card" style={{ textAlign: "center", marginTop: "50px" }}>
        <h1 style={{ marginBottom: "20px", color: "#007bff" }}>
          Welcome to HydroFi
        </h1>
        <h2 style={{ marginBottom: "30px", fontWeight: "normal" }}>
          Blockchain-Based Green Hydrogen Credit System
        </h2>

        <p style={{ fontSize: "18px", marginBottom: "30px", color: "#666" }}>
          A comprehensive platform for managing green hydrogen production,
          certification, and carbon credit trading in a sustainable ecosystem.
        </p>

        {isAuthenticated ? (
          <div>
            <div
              className="alert alert-success"
              style={{ marginBottom: "30px" }}
            >
              Welcome back, {user?.username}! You are logged in as a{" "}
              {user?.role}.
            </div>
            <Link
              to="/dashboard"
              className="btn"
              style={{ fontSize: "18px", padding: "15px 30px" }}
            >
              Go to Dashboard
            </Link>
          </div>
        ) : (
          <div>
            <h3 style={{ marginBottom: "20px" }}>Get Started</h3>
            <p style={{ marginBottom: "30px" }}>
              Join our platform to participate in the green hydrogen ecosystem
            </p>
            <div
              style={{ display: "flex", gap: "20px", justifyContent: "center" }}
            >
              <Link
                to="/register"
                className="btn"
                style={{ fontSize: "18px", padding: "15px 30px" }}
              >
                Register Now
              </Link>
              <Link
                to="/login"
                className="btn btn-secondary"
                style={{ fontSize: "18px", padding: "15px 30px" }}
              >
                Login
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="dashboard-grid" style={{ marginTop: "50px" }}>
        <div className="card">
          <h3>🏭 Green Hydrogen Producers</h3>
          <p>
            Manage production facilities, track hydrogen generation, and earn
            carbon credits for sustainable practices.
          </p>
        </div>

        <div className="card">
          <h3>🏛️ Regulatory Authorities</h3>
          <p>
            Oversee compliance, approve certifications, and ensure industry
            standards are maintained.
          </p>
        </div>

        <div className="card">
          <h3>🏢 Industry Buyers</h3>
          <p>
            Purchase carbon credits, manage portfolios, and meet sustainability
            targets through verified credits.
          </p>
        </div>

        <div className="card">
          <h3>✅ Certification Bodies</h3>
          <p>
            Conduct inspections, issue certifications, and validate green
            hydrogen production standards.
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: "50px", textAlign: "center" }}>
        <h3>About the Platform</h3>
        <p>
          HydroFi leverages blockchain technology to create a transparent,
          secure, and efficient ecosystem for green hydrogen credit management.
          Our platform connects producers, regulators, buyers, and certification
          bodies in a unified marketplace that promotes sustainable energy
          practices.
        </p>
      </div>
    </div>
  );
};

export default Home;
