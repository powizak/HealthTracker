import React from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';

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
        <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 px-4">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center">
                <div className="flex justify-center mb-4">
                    <Heart className="w-12 h-12 text-indigo-600 fill-current" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 mb-2">Vítejte</h1>
                <p className="text-slate-500 mb-8">HealthTracker - Zdraví vaší rodiny pod kontrolou</p>

                <div className="flex justify-center">
                    <button
                        onClick={() => login()}
                        className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition font-medium text-lg w-full justify-center"
                    >
                        <span>Přihlásit přes Google</span>
                    </button>
                </div>
                <p className="text-xs text-slate-400 mt-6">
                    Aplikace vyžaduje přístup ke kalendáři pro synchronizaci záznamů.
                </p>
            </div>
        </div>
    );
};

export default Login;
