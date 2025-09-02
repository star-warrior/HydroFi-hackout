import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import bg from "../assets/forest.png"; // ✅ replace with your forest bg image
import GlassyLayout from "./GlassyLayout";
import { Globe } from "lucide-react";
import { WrapButton } from "./ui/WrapButton";

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

// A simple layout component to mimic GlassyLayout
const Home = () => {
  const { isAuthenticated, user } = useAuth();

  return (
    <GlassyLayout showForestBg={true}>
      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto px-6">
        {/* Social Proof */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <img
            src="https://randomuser.me/api/portraits/men/32.jpg"
            alt="user"
            className="w-6 h-6 rounded-full border-2 border-white"
          />
          <img
            src="https://randomuser.me/api/portraits/women/45.jpg"
            alt="user"
            className="w-6 h-6 rounded-full border-2 border-white -ml-2"
          />
          <span className="text-sm text-gray-600">
            10,000+ people found their calm
          </span>
        </div>

        {/* Hero Heading */}
        <h1 className="text-3xl sm:text-6xl font-bold text-gray-900 mb-4">
          Decentralizing the <thead></thead>{" "}
          <span className="text-gray-900"> </span> future
          <span className="text-10xl italic text-emerald-700">
            {" "}
            of green hydrogen
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg text-gray-600 mb-8">
          Designed with sustainability at its core, HydroFi helps you reconnect
          with green energy and create mindful impact in your everyday life.
        </p>

        {/* Buttons */}
        {/* Buttons */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          {/* ✅ Replaced with WrapButton */}
          <WrapButton
            className="mt-2"
            href={isAuthenticated ? "/dashboard" : "/register"}
          >
            <Globe className="animate-spin" />
            {isAuthenticated ? "Go to Dashboard" : "Start your journey"}
          </WrapButton>

          {!isAuthenticated && (
            <Link
              to="/login"
              className="w-full sm:w-auto px-7 py-3.5 bg-white/80 text-gray-800 font-semibold backdrop-blur-sm border border-white/30 rounded-full hover:bg-white transition-all duration-300 ease-out transform hover:scale-105"
            >
              Learn more
            </Link>
          )}
        </div>
      </div>
    </GlassyLayout>
  );
};

export default Home;
