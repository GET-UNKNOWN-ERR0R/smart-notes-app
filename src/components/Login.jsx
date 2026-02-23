import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";

const Login = ({ setUser }) => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const { data } = await api.post("/api/users/login", { email, password });
            localStorage.setItem("token", data.token);
            setUser(data);
            navigate("/");
        } catch (error) {
            setError(error.response?.data?.message || "Server error");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-purple-100 to-blue-100">
            <div className="w-full max-w-md p-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-3xl shadow-2xl transition-colors">
                <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white mb-6">Login</h2>
                {error && <p className="text-red-500 mb-4 text-center">{error}</p>}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="Email"
                        className="w-full px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-700/60 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-purple-400 transition backdrop-blur-sm"
                        required
                    />
                    <input
                        type="password"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Password"
                        className="w-full px-4 py-3 rounded-2xl border border-gray-300 dark:border-gray-600 bg-white/70 dark:bg-gray-700/60 text-gray-800 dark:text-white outline-none focus:ring-2 focus:ring-purple-400 transition backdrop-blur-sm"
                        required
                    />
                    <button className="w-full py-3 rounded-2xl bg-linear-to-r from-purple-500 to-indigo-500 text-white font-semibold shadow-lg hover:cursor-pointer hover:scale-105  transition transform">
                        Login
                    </button>
                </form>
                <p className="mt-6 text-center text-gray-600 dark:text-gray-300">
                    Don't have an account?{" "}
                    <Link to="/register" className=" text-gray-800 hover:underline">Register</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;