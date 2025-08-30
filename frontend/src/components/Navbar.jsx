import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" style={{ textDecoration: "none", color: "white" }}>
          <h1>HydroFi</h1>
        </Link>

        <div className="navbar-nav">
          {isAuthenticated ? (
            <>
              <span>Welcome, {user?.username}!</span>
              <span>({user?.role})</span>
              <Link to="/dashboard">Dashboard</Link>
              <button
                onClick={handleLogout}
                className="btn btn-secondary"
                style={{ padding: "5px 15px" }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
