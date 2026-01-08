import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Heart, Shield, Activity } from 'lucide-react';

const Login = ({ setUser }) => {
    const navigate = useNavigate();

    const login = useGoogleLogin({
        onSuccess: async (codeResponse) => {
            try {
                const res = await axios.post('/auth/login', {
                    code: codeResponse.code
                }, { withCredentials: true });
                setUser(res.data.user);
                navigate('/');
            } catch (error) {
                console.error('Login Failed', error);
                alert('Přihlášení selhalo');
            }
        },
        flow: 'auth-code',
        scope: 'https://www.googleapis.com/auth/calendar'
    });

    return (
        <div className="min-h-screen flex flex-col justify-center items-center px-4 relative overflow-hidden">
            {/* Animated Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-90"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxLTEuNzktNC00LTRzLTQgMS43OS00IDQgMS43OSA0IDQgNCA0LTEuNzkgNC00em0wLTEwYzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>

            {/* Login Card */}
            <div className="relative max-w-md w-full glass-card p-10 text-center animate-scale-in shadow-premium">
                {/* Logo with Animation */}
                <div className="flex justify-center mb-6 relative">
                    <div className="relative">
                        <Heart className="w-16 h-16 text-indigo-600 dark:text-indigo-400 fill-current animate-pulse-slow" />
                        <div className="absolute inset-0 bg-indigo-500 blur-2xl opacity-30 animate-pulse-slow"></div>
                    </div>
                </div>

                <h1 className="text-4xl font-bold text-gradient-primary mb-3">Vítejte</h1>
                <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg">
                    HealthTracker - Zdraví vaší rodiny pod kontrolou
                </p>

                {/* Login Button */}
                <div className="flex justify-center mb-6">
                    <button
                        onClick={() => login()}
                        className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3"
                    >
                        <svg className="w-6 h-6" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span>Přihlásit přes Google</span>
                    </button>
                </div>

                {/* Features */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="glass-card p-4 text-center hover:scale-105 transition-transform duration-300">
                        <Shield className="w-8 h-8 text-indigo-600 dark:text-indigo-400 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Bezpečné</p>
                    </div>
                    <div className="glass-card p-4 text-center hover:scale-105 transition-transform duration-300">
                        <Activity className="w-8 h-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">Přehledné</p>
                    </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400">
                    Aplikace vyžaduje přístup ke kalendáři pro synchronizaci záznamů.
                </p>
            </div>

            {/* Footer */}
            <p className="relative mt-8 text-white/80 text-sm">
                © 2026 HealthTracker - Rodinný zdravotní deník
            </p>
        </div>
    );
};

export default Login;
