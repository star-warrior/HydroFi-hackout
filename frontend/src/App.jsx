import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { BlockchainProvider } from "./contexts/BlockchainContext";
import { useLocation } from "react-router-dom";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboards/Dashboard";
import WorldMap from "./components/WorldMap";
import Navbar from "./components/Navbar";
import Home from "./components/Home";
import PrivateRoute from "./components/auth/PrivateRoute";
import "./index.css"; // Make sure to import your CSS file

function App() {
  return (
    <AuthProvider>
      <BlockchainProvider>
        <Router>
          <AppContent />
        </Router>
      </BlockchainProvider>
    </AuthProvider>
  );
}

const AppContent = () => {
  const location = useLocation();

  // Check if we're on a page that should have the full navbar
  const isFullNavbarPage = ["/", "/login", "/register"].includes(
    location.pathname
  );

  return (
    <div className="App min-h-screen flex flex-col">
      <Navbar showFull={isFullNavbarPage} />
      <main className="flex-1">
        {" "}
        {/* Added padding to account for fixed navbar */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/map"
            element={
              <PrivateRoute>
                <WorldMap />
              </PrivateRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
    </div>
  );
};

export default App;
