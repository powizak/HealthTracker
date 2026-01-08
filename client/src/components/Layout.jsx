import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Heart, LogOut, Calendar, Plus, Settings as SettingsIcon, Syringe, Ruler, Moon, Sun } from 'lucide-react';
import axios from 'axios';

const Layout = ({ onLogout }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // Check for saved dark mode preference
        const savedMode = localStorage.getItem('darkMode') === 'true';
        setDarkMode(savedMode);
        if (savedMode) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleDarkMode = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('darkMode', newMode);
        if (newMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleLogout = async () => {
        try {
            await axios.post('/auth/logout');
            onLogout();
            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen flex flex-col">
            {/* Premium Header with Glassmorphism */}
            <header className="sticky top-0 z-50 safe-top backdrop-blur-xl bg-white/70 dark:bg-slate-900/70 border-b border-slate-200/50 dark:border-slate-700/50 shadow-sm">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="relative">
                            <Heart className="w-7 h-7 fill-indigo-600 text-indigo-600 dark:fill-indigo-400 dark:text-indigo-400 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6" />
                            <div className="absolute inset-0 bg-indigo-500 blur-lg opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                        </div>
                        <span className="font-bold text-xl bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                            HealthTracker
                        </span>
                    </Link>

                    <div className="flex items-center space-x-2">
                        {/* Desktop Navigation */}
                        <Link
                            to="/vaccinations"
                            className={`hidden md:flex p-2 rounded-xl transition-all duration-300 ${isActive('/vaccinations')
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            title="Očkování"
                        >
                            <Syringe className="w-5 h-5" />
                        </Link>
                        <Link
                            to="/growth"
                            className={`hidden md:flex p-2 rounded-xl transition-all duration-300 ${isActive('/growth')
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            title="Růst"
                        >
                            <Ruler className="w-5 h-5" />
                        </Link>
                        <Link
                            to="/calendar"
                            className={`hidden md:flex p-2 rounded-xl transition-all duration-300 ${isActive('/calendar')
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                            title="Kalendář"
                        >
                            <Calendar className="w-5 h-5" />
                        </Link>

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-300"
                            title={darkMode ? 'Světlý režim' : 'Tmavý režim'}
                        >
                            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        <Link
                            to="/settings"
                            className={`p-2 rounded-xl transition-all duration-300 ${isActive('/settings')
                                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                    : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                                }`}
                        >
                            <SettingsIcon className="w-5 h-5" />
                        </Link>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 dark:hover:text-red-400 transition-all duration-300"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-grow max-w-3xl mx-auto w-full px-4 py-6 animate-fade-in">
                <Outlet />
            </main>

            {/* Premium Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 safe-bottom md:hidden backdrop-blur-xl bg-white/80 dark:bg-slate-900/80 border-t border-slate-200/50 dark:border-slate-700/50 shadow-lg">
                <div className="flex justify-between items-center px-4 py-3">
                    <Link
                        to="/"
                        className={`flex flex-col items-center text-xs transition-all duration-300 ${isActive('/')
                                ? 'text-indigo-600 dark:text-indigo-400 scale-110'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                    >
                        <Heart className={`w-6 h-6 mb-1 transition-all duration-300 ${isActive('/') ? 'fill-current' : ''}`} />
                        Doma
                    </Link>
                    <Link
                        to="/vaccinations"
                        className={`flex flex-col items-center text-xs transition-all duration-300 ${isActive('/vaccinations')
                                ? 'text-indigo-600 dark:text-indigo-400 scale-110'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                    >
                        <Syringe className="w-6 h-6 mb-1" />
                        Očkování
                    </Link>

                    {/* Premium FAB */}
                    <Link
                        to="/add"
                        className="relative -mt-8 group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                        <div className="relative bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-full shadow-lg shadow-indigo-500/50 group-hover:shadow-xl group-hover:shadow-indigo-500/60 transition-all duration-300 group-hover:scale-110">
                            <Plus className="w-6 h-6" />
                        </div>
                    </Link>

                    <Link
                        to="/growth"
                        className={`flex flex-col items-center text-xs transition-all duration-300 ${isActive('/growth')
                                ? 'text-indigo-600 dark:text-indigo-400 scale-110'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                    >
                        <Ruler className="w-6 h-6 mb-1" />
                        Růst
                    </Link>
                    <Link
                        to="/calendar"
                        className={`flex flex-col items-center text-xs transition-all duration-300 ${isActive('/calendar')
                                ? 'text-indigo-600 dark:text-indigo-400 scale-110'
                                : 'text-slate-600 dark:text-slate-400'
                            }`}
                    >
                        <Calendar className="w-6 h-6 mb-1" />
                        Kalendář
                    </Link>
                </div>
            </nav>

            {/* Spacer for bottom nav on mobile */}
            <div className="h-20 md:hidden"></div>
        </div>
    );
};

export default Layout;
