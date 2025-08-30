import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { BlockchainProvider } from "./contexts/BlockchainContext";

// Components
import { Navbar } from "./components/Navbar";
import Home from "./components/Home";
import { Login } from "./components/auth/Login";
import Register from "./components/auth/Register";
import Dashboard from "./components/dashboards/Dashboard";
import PrivateRoute from "./components/auth/PrivateRoute";
import bg from "./assets/bg.jpg";

function App() {
  return (
    <AuthProvider>
      <BlockchainProvider>
        <Router>
          {/* Fixed background container */}
          <div 
            className="fixed top-0 left-0 w-full h-full bg-cover bg-center bg-no-repeat z-0"
            style={{ backgroundImage: `url(${bg})` }}
          ></div>
          
          {/* Content container with scrolling */}
          <div className="relative z-10 min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-grow flex flex-col justify-center items-center text-center px-4 py-8">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <Dashboard />
                    </PrivateRoute>
                  }
                />

                {/* Redirect unknown routes to home */}
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </main>
          </div>
        </Router>
      </BlockchainProvider>
    </AuthProvider>
  );
}

export default App;