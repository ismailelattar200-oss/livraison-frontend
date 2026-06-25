import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, User, Star, Utensils, Truck, Clock, Eye, EyeOff, ArrowRight } from 'lucide-react';

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Check for redirect param
    const queryParams = new URLSearchParams(location.search);
    const redirectUrl = queryParams.get('redirect') || '/';
    const message = queryParams.get('message');

    // If already logged in, redirect immediately to the correct dashboard or redirectUrl
    useEffect(() => {
        if (user) {
            if (redirectUrl !== '/') {
                navigate(redirectUrl);
            } else if (user.role === 'admin') {
                navigate('/admin');
            } else if (user.role === 'staff') {
                if (user.email === 'staff@marea.com') {
                    navigate('/staff');
                } else {
                    navigate('/cuisine');
                }
            } else if (user.role === 'delivery') {
                navigate('/livreur');
            } else {
                navigate('/');
            }
        }
    }, [user, navigate, redirectUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const loggedInUser = await login(credentials);
            if (redirectUrl !== '/') {
                navigate(redirectUrl);
            } else if (loggedInUser.role === 'admin') {
                navigate('/admin');
            } else if (loggedInUser.role === 'staff') {
                if (loggedInUser.email === 'staff@marea.com') {
                    navigate('/staff');
                } else {
                    navigate('/cuisine');
                }
            } else if (loggedInUser.role === 'delivery') {
                navigate('/livreur');
            } else {
                navigate('/');
            }
        } catch (err) {
            setError('Identifiants incorrects. Veuillez réessayer.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleAuth = () => {
        window.location.href = 'http://localhost:8000/api/auth/google/redirect';
    };

    return (
        <div className="h-screen overflow-hidden w-full flex bg-white animate-[fadeIn_0.5s_ease-out]">
            {/* Custom Animation Keyframes inline for ease */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .bg-pattern {
                    background-image: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23C9A84C' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
                }
            `}</style>
            
            {/* LEFT PANEL - Branding (Hidden on very small screens, stretches full height/width) */}
            <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 bg-gradient-to-br from-[#1C1F3A] via-[#2C3154] to-[#C9A84C]/80 relative flex-col items-center justify-center p-16 xl:p-24 overflow-hidden">
                {/* Background Texture/Overlay */}
                <div className="absolute inset-0 bg-pattern mix-blend-overlay opacity-30"></div>
                
                {/* Top Section */}
                <div className="relative z-10 text-center flex flex-col items-center mb-12">
                    <Link to="/" className="inline-block hover:scale-105 transition-transform duration-300">
                        <div className="mb-6 flex justify-center">
                            <span className="text-6xl filter drop-shadow-xl">🍽️</span>
                        </div>
                        <h1 className="font-display text-5xl xl:text-6xl text-white tracking-widest font-bold mb-4 drop-shadow-lg">
                            MAREA
                        </h1>
                    </Link>
                    <p className="text-white/90 text-lg xl:text-xl font-medium tracking-wide drop-shadow-sm">
                        L'élégance de la cuisine marocaine
                    </p>
                </div>

                {/* Middle Section - Badges */}
                <div className="relative z-10 grid grid-cols-2 gap-4 w-full max-w-md mx-auto mb-16">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center justify-center gap-3 shadow-lg hover:bg-white/20 transition-colors">
                        <span className="text-xl">🍽️</span>
                        <span className="text-white font-bold text-sm xl:text-base">+50 Plats</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center justify-center gap-3 shadow-lg hover:bg-white/20 transition-colors">
                        <span className="text-xl">⭐</span>
                        <span className="text-white font-bold text-sm xl:text-base">4.8/5</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center justify-center gap-3 shadow-lg hover:bg-white/20 transition-colors">
                        <span className="text-xl">🚚</span>
                        <span className="text-white font-bold text-sm xl:text-base">Livraison gratuite</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 flex items-center justify-center gap-3 shadow-lg hover:bg-white/20 transition-colors">
                        <span className="text-xl">💎</span>
                        <span className="text-white font-bold text-sm xl:text-base">Premium</span>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="absolute bottom-8 w-full text-center px-8 z-10">
                    <p className="text-white/80 text-sm font-medium italic">
                        "Marea — Tout ce dont vous avez besoin"
                    </p>
                </div>
            </div>

            {/* RIGHT PANEL - Form (Full height) */}
            <div className="w-full lg:w-[55%] xl:w-1/2 flex flex-col justify-center bg-white overflow-y-auto">
                <div className="w-full max-w-xl mx-auto px-8 sm:px-12 py-6">
                    
                    <div className="lg:hidden text-center mb-6">
                        <Link to="/">
                            <h1 className="font-display text-5xl text-[#1C1F3A] tracking-widest font-bold">MAREA</h1>
                        </Link>
                    </div>

                    <div className="mb-6 text-center flex flex-col items-center">
                        <div className="w-12 h-12 bg-[#C9A84C]/10 border border-[#C9A84C]/20 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                            <Lock className="w-6 h-6 text-[#C9A84C]" />
                        </div>
                        <h2 className="text-2xl xl:text-3xl font-bold text-[#1C1F3A] mb-2">Connexion</h2>
                        <p className="text-gray-500 text-sm">Bienvenue ! Connectez-vous à votre compte</p>
                    </div>

                    {message && (
                        <div className="mb-6 bg-blue-50 text-blue-700 p-3 rounded-xl text-sm font-medium border border-blue-100 flex items-center gap-3">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                            {message}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm text-center font-medium border border-red-100 flex items-center justify-center gap-2">
                                <Lock className="w-4 h-4" />
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="block text-sm font-medium text-gray-700">Email</label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400 group-focus-within:text-[#1C1F3A] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                                </div>
                                <input
                                    type="email"
                                    required
                                    value={credentials.email}
                                    onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                                    className="pl-12 w-full bg-[#F0F4F8] border border-transparent rounded-xl py-3 text-base text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] hover:border-[#C9A84C]/50 transition-all outline-none"
                                    placeholder="ismail@gmail.com"
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                                <a href="#" className="text-sm font-medium text-[#1C1F3A] hover:text-[#C9A84C] transition-colors">Mot de passe oublié ?</a>
                            </div>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400 group-focus-within:text-[#1C1F3A] transition-colors" />
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                                    className="pl-12 pr-12 w-full bg-[#F0F4F8] border border-transparent rounded-xl py-3 text-base text-gray-800 focus:bg-white focus:ring-2 focus:ring-[#C9A84C]/30 focus:border-[#C9A84C] hover:border-[#C9A84C]/50 transition-all outline-none"
                                    placeholder="••••••••"
                                />
                                <button 
                                    type="button" 
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-[#C9A84C] hover:bg-[#A68A3D] text-[#1C1F3A] hover:text-white hover:shadow-[0_8px_20px_rgba(201,168,76,0.4)] hover:-translate-y-0.5 font-bold py-3 rounded-xl text-base transition-all duration-300 mt-4 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Connexion en cours...' : 'Se connecter'}
                            {!loading && <ArrowRight className="w-5 h-5" />}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-400 text-xs">OU</span>
                        </div>
                    </div>

                    {/* Google Auth Button */}
                    <button 
                        onClick={handleGoogleAuth}
                        type="button"
                        className="w-full bg-white border border-gray-200 text-gray-700 font-medium py-3 rounded-xl text-sm hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 hover:text-[#C9A84C] transition-all duration-300 flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            <path fill="none" d="M1 1h22v22H1z" />
                        </svg>
                        Continuer avec Google
                    </button>

                    <div className="mt-6 text-center">
                        <p className="text-gray-500 text-sm">
                            Pas encore de compte ?{' '}
                            <Link to={`/inscription?redirect=${redirectUrl}`} className="text-[#1C1F3A] font-semibold hover:underline transition-colors">
                                S'inscrire
                            </Link>
                        </p>
                    </div>

                    <div className="mt-8 text-center">
                        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-[#1C1F3A] transition-colors text-sm font-medium">
                            <span>&larr;</span> Retour au site public
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
