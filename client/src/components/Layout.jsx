import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { Heart, LogOut, Calendar, Plus, Settings as SettingsIcon } from 'lucide-react';
import axios from 'axios';

const Layout = ({ onLogout }) => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post('/auth/logout');
            onLogout();
            navigate('/login');
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <header className="bg-white shadow-sm sticky top-0 z-10 safe-top">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                    <Link to="/" className="flex items-center space-x-2 text-indigo-600 font-bold text-xl">
                        <Heart className="w-6 h-6 fill-current" />
                        <span>HealthTracker</span>
                    </Link>
                    <div className="flex items-center space-x-2">
                        <Link to="/calendar" className="text-slate-500 hover:text-indigo-600 hidden md:block" title="Kalendář">
                            <Calendar className="w-5 h-5" />
                        </Link>
                        <Link to="/settings" className="text-slate-500 hover:text-indigo-600">
                            <SettingsIcon className="w-5 h-5" />
                        </Link>
                        <button onClick={handleLogout} className="text-slate-500 hover:text-red-500">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-grow max-w-3xl mx-auto w-full px-4 py-6">
                <Outlet />
            </main>

            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 safe-bottom md:hidden">
                <div className="flex justify-around items-center py-3">
                    <Link to="/" className="p-2 text-slate-600 hover:text-indigo-600 flex flex-col items-center text-xs">
                        <Heart className="w-6 h-6 mb-1" />
                        Doma
                    </Link>
                    <Link to="/add" className="p-2 text-indigo-600 -mt-8 bg-white rounded-full shadow-lg border border-slate-100">
                        <div className="bg-indigo-600 text-white p-3 rounded-full">
                            <Plus className="w-6 h-6" />
                        </div>
                    </Link>
                    <Link to="/calendar" className="p-2 text-slate-600 hover:text-indigo-600 flex flex-col items-center text-xs">
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
