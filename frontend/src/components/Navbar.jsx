import React, { useState, useEffect } from "react";
// MOCK DATA and Services - Replace with your actual imports
import { useAuth } from "../contexts/AuthContext";


const useNav = () => {
    const navigate = (path) => console.log(`Navigating to ${path}`);
    return { navigate };
};
// --- End Mock Hooks ---


const ArrowRightIcon = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    className={className}
  >
    <path
      fillRule="evenodd"
      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
      clipRule="evenodd"
    />
  </svg>
);


export const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { navigate } = useNav();
  const [showNav, setShowNav] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const controlNavbar = () => {
      // If we're scrolling down and past 100px, hide the navbar
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setShowNav(false);
      } else { // If we're scrolling up, show the navbar
        setShowNav(true);
      }
      // Remember the new scroll position
      setLastScrollY(window.scrollY);
    };

    window.addEventListener('scroll', controlNavbar);

    // Cleanup the event listener on component unmount
    return () => {
      window.removeEventListener('scroll', controlNavbar);
    };
  }, [lastScrollY]);


  const handleLogout = () => {
    logout();
    navigate("home");
  };

  return (
    <>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&family=Inter:wght@400;500;600&display=swap');
          .font-brand {
            font-family: 'Dancing Script', cursive;
          }
          .font-body {
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>
      <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 font-body transition-transform duration-300 ease-in-out ${showNav ? 'translate-y-0' : '-translate-y-24'}`}>
        <div className="flex items-center justify-between w-[90vw] max-w-6xl bg-white/70 backdrop-blur-md rounded-full px-8 py-3 shadow-lg border border-white/40">
          
          <div
            onClick={() => navigate("home")}
            className="font-brand text-4xl text-gray-900 cursor-pointer hover:opacity-80 transition-opacity"
          >
            HydroFi
          </div>

          {/* Links */}
          <div className="hidden md:flex items-center gap-8 text-gray-700 text-sm font-medium">
            <a onClick={() => navigate("home")} className="cursor-pointer hover:text-black transition-colors font-semibold">
              Home
            </a>
            <a className="cursor-pointer hover:text-black transition-colors">About us</a>
            <a className="cursor-pointer hover:text-black transition-colors">FAQ</a>
            <a className="cursor-pointer hover:text-black transition-colors">Contact</a>
          </div>

          {/* Auth Section */}
          <div>
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-gray-600 hidden sm:inline text-sm">
                  Welcome, {user?.username}!
                </span>
                <button
                  onClick={() => navigate("dashboard")}
                  className="flex items-center gap-2 bg-black text-white font-medium py-1.5 px-4 rounded-full hover:bg-gray-900 transition-all text-sm"
                >
                  Dashboard
                </button>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-black transition-colors text-sm font-medium"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => navigate("login")}
                  className="text-gray-700 font-medium py-1.5 px-4 rounded-full hover:bg-gray-100 transition-colors text-sm"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate("register")}
                  className="flex items-center gap-2 bg-black text-white font-medium py-1.5 px-5 rounded-full hover:bg-gray-900 transition-all text-sm"
                >
                  <span>Start your journey</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;

