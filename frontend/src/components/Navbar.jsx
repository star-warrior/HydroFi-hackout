import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

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
    window.addEventListener("scroll", controlNavbar);
    return () => window.removeEventListener("scroll", controlNavbar);
    // eslint-disable-next-line
  }, [lastScrollY]);

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

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&family=Inter:wght@400;500;600&display=swap');
          .font-brand { font-family: 'Playfair Display', serif; }
          .font-body { font-family: 'Inter', sans-serif; }
        `}
      </style>
      <nav
        className={`fixed top-2 left-1/2 -translate-x-1/2 z-50 font-body transition-all duration-500
          ${showNav ? "translate-y-0" : "-translate-y-24"}
          ${isMounted ? "opacity-100" : "opacity-0 -translate-y-8"}
        `}
        style={{ width: "95vw", maxWidth: "1100px", padding: "0 2rem" }}
      >
        <div className="flex items-center justify-between bg-white/80 backdrop-blur rounded-full px-5 py-3 shadow border border-white/30">
          {/* Logo */}
          <Link
            to="/home"
            className="font-brand text-l sm:text-2xl text-gray-800 cursor-pointer hover:opacity-80 transition-opacity"
            style={{ letterSpacing: ".5px", padding: "1rem" }}
          >
            HydroFi
          </Link>

          {/* Navigation Links */}
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

          {/* CTA Buttons */}
      {/* CTA Buttons */}
<div className="flex items-center gap-4 ml-2 mr-4">
  {isAuthenticated ? (
    <div className="flex items-center gap-3">
      <span className="text-gray-700 hidden lg:inline font-medium text-sm">
        Welcome, {user?.username}!
      </span>
      <Link
        to="/dashboard"
        className="bg-black text-white font-semibold py-2 px-5 rounded-full hover:bg-gray-800 transition-transform hover:scale-105 text-sm"
      >
        Dashboard
      </Link>
      <button
        onClick={handleLogout}
        className="text-gray-600 hover:text-black transition-colors text-sm font-medium px-2"
      >
        Logout
      </button>
    </div>
  ) : (
  <Link
    to="/register"
    className="font-medium py-3 px-6 rounded-full hover:shadow-xl hover:scale-105 transition mr-10"
  >
    Start Now!
  </Link>
)
}
</div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;