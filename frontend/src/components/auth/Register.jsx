import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNav } from "../../contexts/RouteContext";
import {
  ChevronDownIcon,
  EnvelopeIcon,
  LockClosedIcon,
  UserIcon,
  FactoryIcon,
} from "../Icons/Icons";

// Layout wrapper for auth pages
const AuthLayout = ({ children, title, subtitle }) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <div className="w-full max-w-md">
      <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-2xl shadow-2xl p-8">
        <div className="text-center text-white mb-8">
          <h2 className="text-3xl font-bold">{title}</h2>
          <p className="text-white/70 mt-2">{subtitle}</p>
        </div>
        {children}
      </div>
    </div>
  </div>
);

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "Green Hydrogen Producer",
    factoryName: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const { navigate } = useNav();

  const roles = [
    "Green Hydrogen Producer",
    "Regulatory Authority",
    "Industry Buyer",
    "Certification Body",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = ${value}`);
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Debug form data changes
  useEffect(() => {
    console.log("Form data updated:", formData);
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    console.log("Final form data before submission:", formData);

    // Validate factory name
    if (formData.role === "Green Hydrogen Producer" && !formData.factoryName.trim()) {
      setError("Factory name is required for Green Hydrogen Producers");
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    try {
      // Create the exact object structure the backend expects
      const registrationData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        ...(formData.role === "Green Hydrogen Producer" && { 
          factoryName: formData.factoryName 
        })
      };
      
      console.log("Sending to API:", registrationData);

      const result = await register(registrationData);

      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.message || "Registration failed");
      }
    } catch (err) {
      console.error("Registration error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join the future of green energy"
    >
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-300 text-center p-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Username */}
        <div className="relative">
          <UserIcon className="w-5 h-5 text-gray-400 absolute top-1/2 -translate-y-1/2 left-3" />
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
            placeholder="Username"
            minLength={3}
            autoComplete="username"
            maxLength={30}
            className="w-full bg-white/5 border border-white/20 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Email */}
        <div className="relative">
          <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute top-1/2 -translate-y-1/2 left-3" />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            placeholder="Email"
            autocomplete="email"
            className="w-full bg-white/5 border border-white/20 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Role */}
        <div className="relative">
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
            
            className="appearance-none w-full bg-white/5 border border-white/20 rounded-lg py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-green-400"
          >
            {roles.map((r) => (
              <option key={r} value={r} className="bg-gray-800">
                {r}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="w-5 h-5 text-gray-400 absolute top-1/2 right-3 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Factory Name (only for Producers) */}
        {formData.role === "Green Hydrogen Producer" && (
          <div className="relative">
            <FactoryIcon className="w-5 h-5 text-gray-400 absolute top-1/2 -translate-y-1/2 left-3" />
            <input
              type="text"
              name="factoryName"
              value={formData.factoryName}
              onChange={handleChange}
              required
              placeholder="Factory Name"
              maxLength={100}
              className="w-full bg-white/5 border border-white/20 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <p className="text-xs text-white/50 mt-1">
              A unique 12-character Factory ID will be generated automatically
            </p>
          </div>
        )}

        {/* Password */}
        <div className="relative">
          <LockClosedIcon className="w-5 h-5 text-gray-400 absolute top-1/2 -translate-y-1/2 left-3" />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            placeholder="Password"
            minLength={6}
            autoComplete="new-password"
            className="w-full bg-white/5 border border-white/20 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Confirm Password */}
        <div className="relative">
          <LockClosedIcon className="w-5 h-5 text-gray-400 absolute top-1/2 -translate-y-1/2 left-3" />
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            autoComplete="new-password"
            placeholder="Confirm Password"
            className="w-full bg-white/5 border border-white/20 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white font-semibold py-3 px-6 rounded-full hover:bg-gray-800 transition-all transform hover:scale-105 disabled:bg-gray-700 disabled:scale-100 flex items-center justify-center gap-2 mt-2"
        >
          {loading ? "Creating Account..." : "Register"}
        </button>
      </form>

      <p className="text-center text-white/60 mt-6">
        Already have an account?{" "}
        <button
          onClick={() => navigate("login")}
          className="font-semibold text-green-300 hover:underline cursor-pointer"
        >
          Login here
        </button>
      </p>
    </AuthLayout>
  );
};

export default Register;