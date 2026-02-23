import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { UserCircle2, LogOut } from "lucide-react";

const Navbar = ({ user, setUser }) => {
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;
        const delay = setTimeout(() => {
            navigate(search.trim() ? `/?search=${encodeURIComponent(search)}` : "/");
        }, 500);
        return () => clearTimeout(delay);
    }, [search, navigate, user]);

    const handleLogout = () => {
        localStorage.removeItem("token");
        setUser(null);
        navigate("/login");
    };

    return (
        <nav className="fixed top-0 left-0 w-full z-50 bg-white/70 dark:bg-blue-950/60 backdrop-blur-lg   shadow-sm">
            <div className="max-w-7xl mx-auto px-5 h-14 flex items-center justify-between">
                <Link
                    to="/"
                    className="flex items-center gap-2 text-lg font-semibold tracking-wide text-gray-900"
                >
                    <span className="
                    flex items-center justify-center
                    w-8 h-8
                    rounded-lg
                  bg-gray-800
                    border border-white/30
                    text-white
                    text-sm font-semibold
                    leading-none
                      ">
                        N
                    </span>
                    <span>Note<span className="font-bold">AI</span></span>
                </Link>

                {user && (
                    <div className="flex-1 flex justify-center px-4">
                        <div className="relative w-full max-w-70 sm:max-w-85">

                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search notes..."
                                className="
                            w-full
                            pl-10 pr-4 py-2
                            rounded-full
                            border border-gray-300 dark:border-gray-600
                            bg-white dark:bg-gray-800
                            text-sm
                            text-gray-800 dark:text-gray-200
                            placeholder-gray-400
                            focus:outline-none
                            focus:ring-2 focus:ring-purple-500
                            focus:border-purple-500
                            transition
                        "
                            />

                            <svg
                                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M16 10a6 6 0 11-12 0 6 6 0 0112 0z" />
                            </svg>
                        </div>
                    </div>
                )}

                {user && (
                    <div className="flex items-center gap-3">

                        <div className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                            <UserCircle2 size={18} className="text-purple-600" />
                            <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {user.username}
                            </span>
                        </div>

                        <button
                            onClick={handleLogout}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-linear-to-r from-red-500 to-pink-500
                              text-white text-sm font-medium
                              shadow-sm
                              hover:shadow-none
                              hover:from-red-600 hover:to-pink-600
                              hover:cursor-pointer
                              active:scale-95
                              transition-all duration-200
                          "
                        >
                            <LogOut size={16} />
                            <span className="hidden md:block">Logout</span>
                        </button>

                    </div>
                )}
            </div>
        </nav>

    );
};

export default Navbar;