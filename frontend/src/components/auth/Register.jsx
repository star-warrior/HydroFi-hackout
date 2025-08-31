import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

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
  const navigate = useNavigate();

  const roles = [
    "Green Hydrogen Producer",
    "Regulatory Authority",
    "Industry Buyer",
    "Certification Body",
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.role === "Green Hydrogen Producer" && !formData.factoryName.trim()) {
      setError("Factory name is required for Green Hydrogen Producers");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    setLoading(true);
    const { confirmPassword, ...registrationData } = formData;
    const result = await register(registrationData);

    if (result.success) {
      navigate("/dashboard");
    } else {
      setError(result.message);
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 bg-gray-900 text-gray-300"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=2070&auto=format&fit=crop')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="w-full max-w-md p-10 space-y-8 bg-gray-800 bg-opacity-60 backdrop-blur-lg rounded-3xl shadow-2xl">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-bold text-white">Discover a space</h2>
          <p className="text-gray-200 text-sm">
            where <span className="font-semibold text-white">calm</span> meets{" "}
            <span className="font-semibold text-white">clarity</span>
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-500 bg-opacity-20 border border-red-500 text-red-300 px-4 py-2 rounded-lg text-center text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-400">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Enter your username"
              minLength={3}
              maxLength={30}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-700 bg-opacity-50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-400">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-700 bg-opacity-50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
            />
          </div>

          {/* Role */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-400">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-700 bg-opacity-50 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition appearance-none"
            >
              {roles.map((role) => (
                <option key={role} value={role} className="bg-gray-800">
                  {role}
                </option>
              ))}
            </select>
          </div>

          {/* Factory Name */}
          {formData.role === "Green Hydrogen Producer" && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-gray-400">Factory Name</label>
              <input
                type="text"
                name="factoryName"
                value={formData.factoryName}
                onChange={handleChange}
                placeholder="Your factory's name"
                maxLength={100}
                required
                className="w-full px-4 py-3 rounded-lg bg-gray-700 bg-opacity-50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
              />
              <small className="text-gray-400 text-xs block mt-1">
                A unique 12-character Factory ID will be generated automatically.
              </small>
            </div>
          )}

          {/* Password */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-400">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a strong password"
              minLength={6}
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-700 bg-opacity-50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
            />
          </div>

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-400">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              required
              className="w-full px-4 py-3 rounded-lg bg-gray-700 bg-opacity-50 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 mt-2 px-6 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white transition-transform transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Account..." : "Start your journey"}
          </button>
        </form>

        {/* Login Link */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-green-400 hover:text-green-300 hover:underline"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
