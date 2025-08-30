import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { ArrowRightIcon, ChevronDownIcon, EnvelopeIcon, LockClosedIcon, UserCircleIcon, UserIcon } from "../Icons/Icons";
import { useNav } from "../../contexts/RouteContext";

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
export const Login = () => {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { navigate } = useNav();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        const result = await login(formData.email, formData.password);
        if (result.success) {
            navigate("dashboard");
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <AuthLayout title="Welcome Back" subtitle="Login to your HydroFi account">
             {error && <div className="bg-red-500/20 border border-red-500 text-red-300 text-center p-3 rounded-lg mb-4">{error}</div>}
             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                    <EnvelopeIcon className="w-5 h-5 text-gray-400 absolute top-1/2 -translate-y-1/2 left-3"/>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="Email"
                        className="w-full bg-white/5 border border-white/20 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                 <div className="relative">
                    <LockClosedIcon className="w-5 h-5 text-gray-400 absolute top-1/2 -translate-y-1/2 left-3"/>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} required placeholder="Password"
                        className="w-full bg-white/5 border border-white/20 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-400" />
                </div>
                 <button type="submit" disabled={loading} className="w-full bg-black text-white font-semibold py-3 px-6 rounded-full hover:bg-gray-800 transition-all transform hover:scale-105 disabled:bg-gray-700 disabled:scale-100 flex items-center justify-center gap-2">
                     {loading ? "Signing in..." : "Login"}
                 </button>
             </form>
             <p className="text-center text-white/60 mt-6">
                Don't have an account?{' '}
                <a onClick={() => navigate('register')} className="font-semibold text-green-300 hover:underline cursor-pointer">Register here</a>
            </p>
        </AuthLayout>
    );
};