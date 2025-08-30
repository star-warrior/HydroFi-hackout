import React, { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNav } from "../contexts/RouteContext";
import { ArrowRightIcon } from "./Icons/Icons";

const Home = () => {
  const { isAuthenticated, user } = useAuth();
  const { navigate } = useNav();

  const [isScrolled, setIsScrolled] = useState(false);

  // Listen for scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: "🏭",
      title: "Green Hydrogen Producers",
      description:
        "Manage production, track generation, and earn carbon credits for sustainable practices.",
    },
    {
      icon: "🏛️",
      title: "Regulatory Authorities",
      description:
        "Oversee compliance, approve certifications, and ensure industry standards are maintained.",
    },
    {
      icon: "🏢",
      title: "Industry Buyers",
      description:
        "Purchase carbon credits, manage portfolios, and meet sustainability targets through verified credits.",
    },
    {
      icon: "✅",
      title: "Certification Bodies",
      description:
        "Conduct inspections, issue certifications, and validate green hydrogen production standards.",
    },
  ];

  return (
    <div className="text-white">
      {/* Hero Section */}
      <div
        className="min-h-screen flex flex-col justify-center items-center text-center px-4 relative bg-cover bg-center bg-no-repeat"
      >

        <div className="relative z-20 flex flex-col items-center">
          {/* Trust Bar */}
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 py-1 px-3 rounded-full mb-4">
            <div className="flex -space-x-2 overflow-hidden">
              <img
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white/20"
                src="https://images.unsplash.com/photo-1491528323818-fdd1faba62cc?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt=""
              />
              <img
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white/20"
                src="https://images.unsplash.com/photo-1550525811-e586910b323f?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt=""
              />
              <img
                className="inline-block h-6 w-6 rounded-full ring-2 ring-white/20"
                src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facearea&facepad=2.25&w=256&h=256&q=80"
                alt=""
              />
            </div>
            <p className="text-sm font-medium">10,000+ users trust HydroFi</p>
          </div>

          {/* Hero Heading */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
            A New Ecosystem for <br />{" "}
            <em className="font-serif italic text-green-600">
              Green Hydrogen
            </em>
          </h1>
          <p className="mt-6 text-lg max-w-2xl text-white/80">
            Leveraging blockchain to create a transparent, secure, and efficient
            platform for green hydrogen credit management.
          </p>

          {/* Auth Buttons */}
          {isAuthenticated ? (
            <div className="mt-10">
              <div className="bg-green-500/20 border border-green-400 text-green-200 px-6 py-3 rounded-lg mb-6">
                Welcome back, {user?.username}! You are logged in as a{" "}
                {user?.role}.
              </div>
              <button
                onClick={() => navigate("dashboard")}
                className="bg-white text-black font-semibold py-3 px-8 rounded-full text-lg hover:bg-opacity-90 transition-all transform hover:scale-105 flex items-center gap-2 mx-auto"
              >
                <span>Go to Dashboard</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="mt-10 flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={() => navigate("register")}
                className="bg-black text-white font-semibold py-3 px-6 rounded-full text-lg hover:bg-gray-800 transition-all transform hover:scale-105 flex items-center gap-2"
              >
                <span>Get Started</span>
                <ArrowRightIcon className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate("login")}
                className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-medium py-3 px-6 rounded-full text-lg hover:bg-white/20 transition-colors"
              >
                Login
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 container mx-auto px-4 bg-black">
        <h2 className="text-4xl font-bold text-center mb-12">
          Built for the Entire Ecosystem
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 hover:border-white/30 transition-all transform hover:-translate-y-1"
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* About Section */}
      <div className="py-20 container mx-auto px-4 text-center bg-black">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl font-bold mb-4">About HydroFi</h2>
          <p className="text-white/80 text-lg">
            HydroFi connects producers, regulators, buyers, and certification
            bodies in a unified marketplace that promotes sustainable energy
            practices. Our platform ensures integrity and trust in the green
            energy sector.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Home;
