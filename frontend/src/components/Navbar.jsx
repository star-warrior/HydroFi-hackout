import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  // Check if we're on a page that should have the small navbar
  const isSmallNavbarPage = !["/", "/home", "/login", "/register"].includes(location.pathname);
  
  // Hide/show navbar on scroll
  useEffect(() => {
    const controlNavbar = () => {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setShowNav(false);
      } else {
        setShowNav(true);
      }
      setLastScrollY(window.scrollY);
    };
    
    // Only apply scroll behavior on home page
    if (location.pathname === "/" || location.pathname === "/home") {
      window.addEventListener("scroll", controlNavbar);
    } else {
      setShowNav(true); // Always show on other pages
    }
    
    return () => window.removeEventListener("scroll", controlNavbar);
  }, [lastScrollY, location.pathname]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/home");
  };

  const navLinks = [
    { name: "Home", path: "/home" },
    { name: "About us", path: "/about" },
    { name: "FAQ", path: "/faq" },
    { name: "Contact", path: "/contact" },
  ];

  // Determine navbar style based on page
  const shouldShowSmallNavbar = isSmallNavbarPage;

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap');
          .font-brand { font-family: 'Playfair Display', serif; }
          .font-body { font-family: 'Inter', sans-serif; }
        `}
      </style>
      
      <AnimatePresence>
        <motion.nav
          initial={{ 
            height: shouldShowSmallNavbar ? 60 : 80,
            backgroundColor: shouldShowSmallNavbar ? "#1A2421" : "transparent",
            top: shouldShowSmallNavbar ? 0 : 8,
            width: shouldShowSmallNavbar ? "100vw" : "95vw",
            maxWidth: shouldShowSmallNavbar ? "100%" : "1100px",
            borderRadius: shouldShowSmallNavbar ? 0 : "9999px",
            padding: shouldShowSmallNavbar ? "0 1rem" : "0 2rem"
          }}
          animate={{ 
            height: shouldShowSmallNavbar ? 60 : 80,
            backgroundColor: shouldShowSmallNavbar ? "#1A2421" : "rgba(255, 255, 255, 0.8)",
            top: shouldShowSmallNavbar ? 0 : 8,
            width: shouldShowSmallNavbar ? "100vw" : "95vw",
            maxWidth: shouldShowSmallNavbar ? "100%" : "1100px",
            borderRadius: shouldShowSmallNavbar ? 0 : "9999px",
            padding: shouldShowSmallNavbar ? "0 1rem" : "0 2rem"
          }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className={`fixed left-1/2 -translate-x-1/2 z-50 font-body transition-all duration-500 backdrop-blur
            ${showNav ? "translate-y-0" : "-translate-y-24"}
            ${isMounted ? "opacity-100" : "opacity-0 -translate-y-8"}
            ${shouldShowSmallNavbar ? "shadow-none border-none" : "shadow border border-white/30"}
          `}
        >
          <div className={`flex items-center justify-between h-full ${shouldShowSmallNavbar ? "px-4" : "px-5 py-3"}`}>
            {/* Logo */}
            <Link
              to="/home"
              className="font-brand cursor-pointer hover:opacity-80 transition-opacity flex items-center"
              style={{ 
                letterSpacing: ".5px", 
                padding: shouldShowSmallNavbar ? "0.5rem" : "1rem",
                color: shouldShowSmallNavbar ? "white" : "#1f2937",
                fontSize: shouldShowSmallNavbar ? "1.25rem" : "1.5rem"
              }}
            >
              HydroFi
            </Link>

            {/* Navigation Links - Only show on home page */}
            {!shouldShowSmallNavbar && (
              <div className="hidden md:flex items-center gap-7 text-gray-600 text-base font-medium">
                {navLinks.map((link) => (
                  <Link
                    key={link.name}
                    to={link.path}
                    className="relative hover:text-black px-1 transition-colors duration-300 after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-full after:h-[2px] after:bg-black after:origin-left after:scale-x-0 after:transition-transform hover:after:scale-x-100"
                    style={{ paddingBottom: "4px" }}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            )}

            {/* Show dashboard/map links when on small navbar pages */}
            {shouldShowSmallNavbar && (
              <div className="hidden md:flex items-center gap-5 text-gray-300 text-base font-medium">
                <Link
                  to="/dashboard"
                  className={`px-3 py-1 rounded-md ${location.pathname === "/dashboard" ? "bg-brand-accent text-white" : "hover:bg-white/10"}`}
                >
                  Dashboard
                </Link>
                <Link
                  to="/map"
                  className={`px-3 py-1 rounded-md ${location.pathname === "/map" ? "bg-brand-accent text-white" : "hover:bg-white/10"}`}
                >
                  Map
                </Link>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex items-center gap-4 ml-2">
              {isAuthenticated ? (
                <div className="flex items-center gap-3">
                  <span className="hidden lg:inline font-medium text-sm"
                    style={{ color: shouldShowSmallNavbar ? "white" : "#374151" }}
                  >
                    Welcome, {user?.username}!
                  </span>
                  <Link
                    to="/dashboard"
                    className="bg-brand-accent text-white font-semibold py-2 px-5 rounded-full hover:bg-teal-600 transition-transform hover:scale-105 text-sm"
                  >
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="px-2 transition-colors text-sm font-medium"
                    style={{ color: shouldShowSmallNavbar ? "#d1d5db" : "#4b5563" }}
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  {!shouldShowSmallNavbar && (
                    <Link
                      to="/login"
                      className="font-medium text-sm px-3 transition-colors"
                      style={{ color: shouldShowSmallNavbar ? "white" : "#4b5563" }}
                    >
                      Login
                    </Link>
                  )}
                  <Link
                    to="/register"
                    className="font-medium py-2 px-5 rounded-full hover:shadow-xl hover:scale-105 transition text-sm"
                    style={{ 
                      backgroundColor: shouldShowSmallNavbar ? "#00A786" : "black",
                      color: "white"
                    }}
                  >
                    {shouldShowSmallNavbar ? "Get Started" : "Start Now!"}
                  </Link>
                </div>
              )}
            </div>
          </div>
        </motion.nav>
      </AnimatePresence>
    </>
  );
};

export default Navbar;