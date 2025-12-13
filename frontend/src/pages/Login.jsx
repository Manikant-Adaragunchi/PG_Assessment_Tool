import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Login Page: Submit clicked", email);
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            console.log("Login Page: Success, Navigating...");

            // Get user from local storage to check role for redirect
            // Note: login() updates state but state update might be async,
            // so we can rely on the returned user object from the API response 
            // if we refactored login to return it, or just read from localStorage
            const userData = JSON.parse(localStorage.getItem('user'));

            if (userData?.role === 'HOD') navigate('/admin/dashboard');
            else if (userData?.role === 'FACULTY') navigate('/faculty/dashboard');
            else if (userData?.role === 'INTERN') navigate('/pg/dashboard');
            else navigate('/'); // Fallback
        } catch (err) {
            console.error("Login Page: Error caught", err);
            setError(err);
        } finally {
            setLoading(false);
        }
    };

    // Helper for Demo (Pre-fill credentials)
    const setDemoParams = (role) => {
        // These rely on the backend seeder being run or manually created users
        // For now, I'll just fill the email logic we plan to use.
        if (role === 'HOD') { setEmail('admin@example.com'); setPassword('admin123'); }
        if (role === 'FACULTY') { setEmail('faculty@example.com'); setPassword('password123'); }
        if (role === 'INTERN') { setEmail('intern@example.com'); setPassword('password123'); }
    }

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden font-sans bg-[url('/hospital-bg.jpg')] bg-cover bg-center bg-fixed">
            {/* Professional Overlay: Gradient Blue-Black for readability */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/80 to-black/60 backdrop-blur-[2px] z-0"></div>

            <div className="relative z-10 w-full max-w-md p-6 animate-fade-in-up">
                {/* Glassmorphism Card */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-10 rounded-2xl shadow-2xl shadow-blue-900/50">

                    {/* Header Section */}
                    <div className="text-center mb-10">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ring-4 ring-white/20">
                            {/* Medical Cross Icon */}
                            <svg className="w-10 h-10 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight drop-shadow-md">SDM Medical Science<br /><span className="text-blue-200 text-2xl font-medium">and Hospital</span></h1>
                        <div className="h-1 w-20 bg-blue-500 mx-auto rounded-full mt-3 mb-2"></div>
                        <p className="text-blue-100 text-sm font-medium tracking-wide border px-3 py-1 rounded-full border-blue-400/30 inline-block bg-blue-900/30">
                            PG Assessment Portal
                        </p>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="bg-red-500/80 border border-red-400 text-white text-sm p-3 rounded-lg text-center backdrop-blur-sm shadow-sm flex items-center justify-center gap-2">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                {error}
                            </div>
                        )}

                        <div className="space-y-4">
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-200 group-focus-within:text-white transition-colors">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-blue-300/30 rounded-lg leading-5 bg-white/10 text-white placeholder-blue-200 focus:outline-none focus:bg-white/20 focus:border-white focus:ring-1 focus:ring-white transition-all duration-200 sm:text-sm"
                                    placeholder="Enter your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-200 group-focus-within:text-white transition-colors">
                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <input
                                    type="password"
                                    required
                                    className="block w-full pl-10 pr-3 py-3 border border-blue-300/30 rounded-lg leading-5 bg-white/10 text-white placeholder-blue-200 focus:outline-none focus:bg-white/20 focus:border-white focus:ring-1 focus:ring-white transition-all duration-200 sm:text-sm"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-bold text-blue-900 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4 text-blue-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Authenticating...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>

                    {/* Developer Shortcuts */}
                    <div className="mt-8 pt-6 border-t border-white/10 text-center">
                        <p className="text-center text-[10px] text-blue-200 mb-3 uppercase tracking-widest opacity-60">Developer Access</p>
                        <div className="flex justify-center gap-2">
                            {['HOD', 'FACULTY', 'INTERN'].map(role => (
                                <button
                                    key={role}
                                    onClick={() => setDemoParams(role)}
                                    className="px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-blue-100 hover:bg-white/20 hover:text-white transition"
                                >
                                    {role}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="text-center text-blue-200/60 text-xs mt-6">
                    &copy; {new Date().getFullYear()} SDM Medical Science and Hospital
                </p>
            </div>
        </div>
    );
};

export default Login;
