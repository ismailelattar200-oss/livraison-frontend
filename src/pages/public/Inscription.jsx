import { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Lock, User, Mail, Phone, Star, Utensils, Truck, Clock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Inscription = () => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Check for redirect param
    const queryParams = new URLSearchParams(location.search);
    const redirectUrl = queryParams.get('redirect') || '/login';

    // If already logged in, redirect immediately
    useEffect(() => {
        if (user) {
            navigate(redirectUrl === '/login' ? '/' : redirectUrl);
        }
    }, [user, navigate, redirectUrl]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Les mots de passe ne correspondent pas.');
            setLoading(false);
            return;
        }

        // Mock registration logic as there is no backend endpoint yet
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Redirect to login with redirectUrl
            navigate(`/login?redirect=${redirectUrl}&message=Compte créé avec succès. Veuillez vous connecter.`);
        } catch (err) {
            setError('Erreur lors de l\'inscription. Veuillez réessayer.');
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
                        "Marea — L'élégance de la restauration"
                    </p>
                </div>
            </div>

            {/* RIGHT PANEL - Form (Full height) */}
            <div className="w-full lg:w-[55%] xl:w-1/2 flex flex-col justify-center bg-[#F8F9FE] overflow-y-auto">
                <div className="w-full max-w-[420px] mx-auto px-6 py-2">
                    <div className="lg:hidden text-center mb-4">
                        <Link to="/">
                            <h1 className="font-display text-4xl text-[#1C1F3A] tracking-widest font-bold">MAREA</h1>
                        </Link>
                    </div>

                    <div className="mb-4 text-left">
                        <h2 className="text-2xl font-extrabold text-[#1C1F3A] mb-1 tracking-tight">Créer un compte</h2>
                        <p className="text-gray-500 text-sm">Inscrivez-vous gratuitement pour commencer vos achats</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-3">
                        {error && (
                            <div className="bg-red-50 text-red-600 p-2 rounded-xl text-sm text-center font-medium border border-red-100">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-[#1C1F3A]">Nom complet</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-[#F0F4F8] border border-transparent rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:bg-white focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/30 transition-all outline-none"
                                placeholder="Votre nom"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-[#1C1F3A]">Email</label>
                            <input
                                type="email"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-[#F0F4F8] border border-transparent rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:bg-white focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/30 transition-all outline-none"
                                placeholder="ismail@gmail.com"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-[#1C1F3A]">Mot de passe</label>
                            <input
                                type="password"
                                required
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-[#F0F4F8] border border-transparent rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:bg-white focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/30 transition-all outline-none"
                                placeholder="••••••"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-[#1C1F3A]">Confirmer le mot de passe</label>
                            <input
                                type="password"
                                required
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                className="w-full bg-[#F0F4F8] border border-transparent rounded-lg px-4 py-2.5 text-sm text-gray-800 focus:bg-white focus:border-[#C9A84C] focus:ring-2 focus:ring-[#C9A84C]/30 transition-all outline-none"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full bg-[#C9A84C] hover:bg-[#A68A3D] text-[#1C1F3A] hover:text-white font-bold py-2.5 rounded-lg text-sm transition-all duration-300 mt-4 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {loading ? 'Création en cours...' : 'Créer mon compte'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-4">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-[#F8F9FE] text-gray-400 text-xs">OU</span>
                        </div>
                    </div>

                    {/* Google Auth Button */}
                    <button 
                        onClick={handleGoogleAuth}
                        type="button"
                        className="w-full bg-transparent border border-gray-300 text-gray-700 font-semibold py-2.5 rounded-lg text-sm hover:bg-gray-50 transition-all flex items-center justify-center gap-3"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            <path fill="none" d="M1 1h22v22H1z" />
                        </svg>
                        Continuer avec Google
                    </button>

                    <div className="mt-4 text-center">
                        <p className="text-gray-500 text-sm">
                            Déjà inscrit ?{' '}
                            <Link to={`/login?redirect=${redirectUrl}`} className="text-[#C9A84C] font-semibold hover:underline transition-colors">
                                Se connecter
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Inscription;
